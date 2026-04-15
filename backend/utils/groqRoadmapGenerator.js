const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GENERIC_DOC_URL = "https://developer.mozilla.org/en-US/";

const sanitizeRoadmapUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return GENERIC_DOC_URL;
  } catch {
    return GENERIC_DOC_URL;
  }
};

const buildFallbackRoadmap = (missingSkills = [], targetRole = "Target Role") => {
  const fallbackSkills = missingSkills.length ? missingSkills : ["Core fundamentals", "Projects", "Interview practice"];

  return fallbackSkills.slice(0, 3).flatMap((skill, index) => ([
    {
      month: index + 1,
      milestone: `Learn ${skill}`,
      description: `Study the fundamentals of ${skill} and take notes on the most important concepts for ${targetRole}.`,
      resourceUrl: GENERIC_DOC_URL,
    },
    {
      month: index + 1,
      milestone: `Practice ${skill}`,
      description: `Build one focused practice exercise or mini-project using ${skill} so you can demonstrate applied understanding.`,
      resourceUrl: "https://www.freecodecamp.org/learn/",
    },
  ]));
};

const parseRoadmapResponse = (content, missingSkills, targetRole) => {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return buildFallbackRoadmap(missingSkills, targetRole);
    }

    return parsed.map((item, index) => ({
      month: Number(item?.month) || Math.min(3, Math.floor(index / 2) + 1),
      milestone: String(item?.milestone || `Milestone ${index + 1}`).trim(),
      description: String(item?.description || `Build progress toward ${targetRole}.`).trim(),
      resourceUrl: sanitizeRoadmapUrl(item?.resourceUrl),
    }));
  } catch {
    return buildFallbackRoadmap(missingSkills, targetRole);
  }
};

async function generateGroqRoadmap({ missingSkills = [], targetRole = "Target Role" }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return buildFallbackRoadmap(missingSkills, targetRole);
  }

  const systemPrompt =
    `You are a Senior Technical Career Coach. Generate a detailed 3-month study roadmap for a student missing these skills: ${missingSkills.join(", ") || "core skills"} for the role of ${targetRole}. ` +
    "For each month, provide 2 key milestones. For each milestone, provide a REAL, valid URL to a high-quality free resource (YouTube, official docs, or freeCodeCamp). " +
    "Return ONLY a JSON array of objects with keys: month, milestone, description, and resourceUrl.";

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              `${systemPrompt} Wrap the array in a JSON object as { "roadmap": [...] } and do not include any extra text.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              missingSkills,
              targetRole,
            }),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || "{}";
    let normalizedContent = content;

    try {
      const parsedObject = JSON.parse(content);
      if (Array.isArray(parsedObject)) {
        normalizedContent = JSON.stringify(parsedObject);
      } else if (Array.isArray(parsedObject?.roadmap)) {
        normalizedContent = JSON.stringify(parsedObject.roadmap);
      }
    } catch {
      normalizedContent = content;
    }

    return parseRoadmapResponse(normalizedContent, missingSkills, targetRole);
  } catch (error) {
    return buildFallbackRoadmap(missingSkills, targetRole);
  }
}

module.exports = { generateGroqRoadmap, buildFallbackRoadmap };
