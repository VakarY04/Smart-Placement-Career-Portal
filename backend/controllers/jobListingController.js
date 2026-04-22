const Application = require("../models/Application");
const JobListing = require("../models/JobListing");
const StudentProfile = require("../models/StudentProfile");

const normalizeSkills = (skills = []) =>
  [...new Set(
    skills
      .filter(Boolean)
      .map((skill) => skill.toString().trim())
      .filter(Boolean)
  )];

exports.createJobListing = async (req, res) => {
  try {
    const { title, company, description, requiredSkills, cgpaThreshold } = req.body;

    const listing = await JobListing.create({
      title,
      company,
      description,
      requiredSkills: normalizeSkills(requiredSkills),
      cgpaThreshold,
      createdBy: req.user._id,
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create job listing" });
  }
};

exports.getJobListings = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const listings = await JobListing.find(query)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job listings" });
  }
};

exports.getLatestJobListings = async (req, res) => {
  try {
    const listings = await JobListing.find({ isActive: true })
      .select("title company requiredSkills cgpaThreshold createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch latest job listings" });
  }
};

exports.updateJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);

    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    const { title, company, description, requiredSkills, cgpaThreshold, isActive } = req.body;

    listing.title = title ?? listing.title;
    listing.company = company ?? listing.company;
    listing.description = description ?? listing.description;
    listing.requiredSkills = requiredSkills ? normalizeSkills(requiredSkills) : listing.requiredSkills;
    listing.cgpaThreshold = cgpaThreshold ?? listing.cgpaThreshold;
    if (typeof isActive === "boolean") {
      listing.isActive = isActive;
    }

    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job listing" });
  }
};

exports.deleteJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);

    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    listing.isActive = false;
    await listing.save();

    res.json({ message: "Job listing deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job listing" });
  }
};

exports.getJobAnalytics = async (req, res) => {
  try {
    const listings = await JobListing.find({ isActive: true }).lean();
    const profiles = await StudentProfile.find({}, "skills cgpa").lean();

    const applicantCounts = await Application.aggregate([
      {
        $match: {
          jobId: {
            $in: listings.map((listing) => listing._id.toString()),
          },
        },
      },
      {
        $group: {
          _id: "$jobId",
          totalApplicants: { $sum: 1 },
        },
      },
    ]);

    const applicantCountMap = applicantCounts.reduce((acc, entry) => {
      acc[entry._id] = entry.totalApplicants;
      return acc;
    }, {});

    const skillGapMap = new Map();

    listings.forEach((listing) => {
      const normalizedRequiredSkills = normalizeSkills(listing.requiredSkills).map((skill) =>
        skill.toLowerCase()
      );

      profiles.forEach((profile) => {
        const profileCgpa = Number(profile.cgpa) || 0;
        if (profileCgpa < Number(listing.cgpaThreshold || 0)) {
          return;
        }

        const studentSkills = new Set(
          normalizeSkills(profile.skills).map((skill) => skill.toLowerCase())
        );

        normalizedRequiredSkills.forEach((skill) => {
          if (!studentSkills.has(skill)) {
            const current = skillGapMap.get(skill) || 0;
            skillGapMap.set(skill, current + 1);
          }
        });
      });
    });

    const jobApplicantStats = listings.map((listing) => ({
      jobId: listing._id,
      title: listing.title,
      company: listing.company,
      totalApplicants: applicantCountMap[listing._id.toString()] || 0,
    }));

    const topSkillGaps = [...skillGapMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({
        skill,
        affectedStudents: count,
      }));

    res.json({
      totalActiveJobs: listings.length,
      jobApplicantStats,
      topSkillGaps,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
