const Resource = require("../models/Resource");
const { generateGroqRoadmap } = require("../utils/groqRoadmapGenerator");

const normalizeSlug = (slug) => String(slug || "").trim().toLowerCase();

const collectResourceSlugs = (roadmap = {}) => {
  const slugs = new Set();
  const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];

  phases.forEach((phase) => {
    const skills = Array.isArray(phase.skills) ? phase.skills : [];
    skills.forEach((skill) => {
      const resourceSlugs = Array.isArray(skill.resource_slugs) ? skill.resource_slugs : [];
      resourceSlugs.forEach((slug) => {
        const normalized = normalizeSlug(slug);
        if (normalized) slugs.add(normalized);
      });
    });
  });

  return Array.from(slugs);
};

const hydrateRoadmapResources = async (roadmap = {}) => {
  const requestedSlugs = collectResourceSlugs(roadmap);
  const resources = requestedSlugs.length
    ? await Resource.find({ slug: { $in: requestedSlugs } }, "slug title url platform difficulty").lean()
    : [];
  const resourceBySlug = new Map(resources.map((resource) => [resource.slug, resource]));

  const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];

  return {
    phases: phases.map((phase) => ({
      name: phase.name,
      skills: (Array.isArray(phase.skills) ? phase.skills : []).map((skill) => {
        const resourceSlugs = Array.isArray(skill.resource_slugs) ? skill.resource_slugs : [];
        const hydratedResources = resourceSlugs
          .map((slug) => resourceBySlug.get(normalizeSlug(slug)))
          .filter(Boolean);

        return {
          skill: skill.skill,
          milestone: skill.milestone,
          description: skill.description,
          resources: hydratedResources,
        };
      }),
    })),
  };
};

const buildHydratedRoadmap = async ({ missingSkills = [], targetRole = "Target Role" }) => {
  const registryResources = await Resource.find({}, "slug").sort({ slug: 1 }).lean();
  const resourceSlugs = registryResources.map((resource) => resource.slug).filter(Boolean);
  const rawRoadmap = await generateGroqRoadmap({ missingSkills, targetRole, resourceSlugs });

  return hydrateRoadmapResources(rawRoadmap);
};

const getSmartRoadmap = async (req, res) => {
  try {
    const { missingSkills = [], targetRole = "" } = req.body || {};

    if (!Array.isArray(missingSkills) || !targetRole) {
      return res.status(400).json({ message: "missingSkills array and targetRole are required" });
    }

    const roadmap = await buildHydratedRoadmap({ missingSkills, targetRole });
    return res.json({ roadmap });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate roadmap", error: error.message });
  }
};

module.exports = {
  getSmartRoadmap,
  buildHydratedRoadmap,
  collectResourceSlugs,
  hydrateRoadmapResources,
};
