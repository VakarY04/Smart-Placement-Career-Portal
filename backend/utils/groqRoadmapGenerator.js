const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const PHASE_NAMES = ["Foundational", "Core", "Specialized"];

const normalizeSlug = (slug) => String(slug || "").trim().toLowerCase();

const pickFallbackSlugs = (availableSlugs = [], index = 0) => {
  const slugs = availableSlugs.map(normalizeSlug).filter(Boolean);
  if (!slugs.length) return [];
  return [slugs[index % slugs.length], slugs[(index + 1) % slugs.length]].filter((slug, slugIndex, array) => array.indexOf(slug) === slugIndex);
};

const buildFallbackRoadmap = (missingSkills = [], targetRole = "Target Role", resourceSlugs = []) => {
  const fallbackSkills = missingSkills.length ? missingSkills : ["Core fundamentals", "Projects", "Interview practice"];

  const phases = PHASE_NAMES.map((phaseName, phaseIndex) => ({
    name: phaseName,
    skills: fallbackSkills
      .filter((_, skillIndex) => skillIndex % PHASE_NAMES.length === phaseIndex)
      .map((skill, index) => ({
        skill: String(skill || `Skill ${index + 1}`).trim(),
        milestone: `${phaseName}: ${skill}`,
        description: `Build practical confidence in ${skill} for ${targetRole}, then apply it in a small portfolio-ready task.`,
        resource_slugs: pickFallbackSlugs(resourceSlugs, phaseIndex + index),
      })),
  }));

  const populatedPhases = phases.filter((phase) => phase.skills.length > 0);

  if (populatedPhases.length) {
    return { phases: populatedPhases };
  }

  return {
    phases: [
      {
        name: "Foundational",
        skills: [
          {
            skill: "Core fundamentals",
            milestone: `Prepare for ${targetRole}`,
            description: `Review the core concepts and build one focused practice project for ${targetRole}.`,
            resource_slugs: pickFallbackSlugs(resourceSlugs, 0),
          },
        ],
      },
    ],
  };
};

const normalizeSkillStep = (step = {}, index = 0, targetRole = "Target Role", allowedSlugSet = new Set()) => {
  const rawSlugs = Array.isArray(step.resource_slugs)
    ? step.resource_slugs
    : Array.isArray(step.resourceSlugs)
      ? step.resourceSlugs
      : [];

  const resource_slugs = rawSlugs
    .map(normalizeSlug)
    .filter((slug, slugIndex, array) => slug && allowedSlugSet.has(slug) && array.indexOf(slug) === slugIndex)
    .slice(0, 3);

  return {
    skill: String(step.skill || step.milestone || `Skill ${index + 1}`).trim(),
    milestone: String(step.milestone || step.skill || `Build milestone ${index + 1}`).trim(),
    description: String(step.description || `Build progress toward ${targetRole}.`).trim(),
    resource_slugs,
  };
};

const parseRoadmapResponse = (content, missingSkills, targetRole, resourceSlugs = []) => {
  const allowedSlugSet = new Set(resourceSlugs.map(normalizeSlug).filter(Boolean));

  try {
    const parsed = JSON.parse(content);
    const rawPhases = Array.isArray(parsed?.phases) ? parsed.phases : [];

    if (!rawPhases.length) {
      return buildFallbackRoadmap(missingSkills, targetRole, resourceSlugs);
    }

    const phases = rawPhases
      .map((phase, phaseIndex) => {
        const skills = Array.isArray(phase?.skills) ? phase.skills : [];
        return {
          name: PHASE_NAMES.includes(phase?.name) ? phase.name : PHASE_NAMES[phaseIndex] || `Phase ${phaseIndex + 1}`,
          skills: skills.map((step, index) => normalizeSkillStep(step, index, targetRole, allowedSlugSet)),
        };
      })
      .filter((phase) => phase.skills.length > 0);

    if (!phases.length) {
      return buildFallbackRoadmap(missingSkills, targetRole, resourceSlugs);
    }

    return { phases };
  } catch {
    return buildFallbackRoadmap(missingSkills, targetRole, resourceSlugs);
  }
};

const buildSystemPrompt = ({ missingSkills = [], targetRole = "Target Role", resourceSlugs = [] }) => {
  const allowedSlugs = resourceSlugs.map(normalizeSlug).filter(Boolean);

  return [
    "You are a Senior Technical Career Coach.",
    "Output strictly JSON format.",
    "Do not generate URLs.",
    `Only use the following resource_slugs in your response: [${allowedSlugs.join(", ")}].`,
    "Organize skills into logical Phases (Foundational, Core, Specialized) rather than months.",
    `Create a roadmap for a student missing these skills: ${missingSkills.join(", ") || "core skills"} for the role of ${targetRole}.`,
    "Return exactly this JSON shape: { \"phases\": [{ \"name\": \"Foundational\", \"skills\": [{ \"skill\": \"Skill name\", \"milestone\": \"Milestone title\", \"description\": \"Actionable guidance\", \"resource_slugs\": [\"slug-from-list\"] }] }] }.",
    "Use only phase names Foundational, Core, and Specialized. Each skill should include one to three resource_slugs from the allowed list.",
  ].join(" ");
};

async function generateGroqRoadmap({ missingSkills = [], targetRole = "Target Role", resourceSlugs = [] }) {
  const apiKey = process.env.GROQ_API_KEY;
  const normalizedResourceSlugs = resourceSlugs.map(normalizeSlug).filter(Boolean);

  if (!apiKey) {
    return buildFallbackRoadmap(missingSkills, targetRole, normalizedResourceSlugs);
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt({ missingSkills, targetRole, resourceSlugs: normalizedResourceSlugs }),
          },
          {
            role: "user",
            content: JSON.stringify({
              missingSkills,
              targetRole,
              allowed_resource_slugs: normalizedResourceSlugs,
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
    return parseRoadmapResponse(content, missingSkills, targetRole, normalizedResourceSlugs);
  } catch {
    return buildFallbackRoadmap(missingSkills, targetRole, normalizedResourceSlugs);
  }
}

module.exports = { generateGroqRoadmap, buildFallbackRoadmap, buildSystemPrompt };
