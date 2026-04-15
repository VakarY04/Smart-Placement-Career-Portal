require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const upload = require("./config/multer");

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  try {
    const fileStream = fs.createReadStream(req.file.path);
    
    const formData = new FormData();
    formData.append("file", fileStream, req.file.originalname);

    const aiResponse = await axios.post("http://127.0.0.1:8000/parse-resume", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const skills = aiResponse.data.skills || [];
    const ats = aiResponse.data.ats || null;
    
    res.json({
      message: "Skills extracted successfully",
      skills: skills,
      ats: ats
    });
  } catch (error) {
    console.error("AI Service Error:", error.message);
    res.status(500).json({ message: "Failed to extract skills", error: error.message });
  }
});

const Profile = require("./models/StudentProfile");
const JobListing = require("./models/JobListing");
const { protect } = require("./middleware/authMiddleware");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const buildStudentPayload = (profile) => ({
  cgpa: Number(profile.cgpa) || 0,
  skills: Array.isArray(profile.skills) ? profile.skills : [],
  interests: Array.isArray(profile.interests) ? profile.interests : [],
  internships: Array.isArray(profile.internships) ? profile.internships : [],
  certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
  bio: Array.isArray(profile.bio) ? profile.bio.join("\n") : (profile.bio || "")
});

const buildJobPayload = (listing) => ({
  id: listing._id.toString(),
  _id: listing._id.toString(),
  title: listing.title,
  company: listing.company,
  description: listing.description,
  required_skills: Array.isArray(listing.requiredSkills) ? listing.requiredSkills : [],
  min_cgpa: Number(listing.cgpaThreshold) || 0,
});

app.get("/api/recommendations", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not complete yet" });
    }

    const jobListings = await JobListing.find({ isActive: true }).sort({ createdAt: -1 });
    if (!jobListings.length) {
      return res.json({ recommendations: [] });
    }

    const aiPayload = {
      student: buildStudentPayload(profile),
      jobs: jobListings.map(buildJobPayload),
    };

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-matches`, aiPayload, {
      timeout: 20000,
    });
    res.json(aiResponse.data);

  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "AI matching timed out. Please try again in a few seconds.",
      });
    }
    if (error.response) {
      console.error("AI Recommendation Error Payload:", error.response.data);
    }
    console.error("AI Recommendation Error:", error.message);
    res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
  }
});

app.get("/api/recommend", protect, async (req, res) => {
  return res.redirect(307, "/api/recommendations");
});

app.get("/api/roadmap/:jobId", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const jobListing = await JobListing.findOne({ _id: req.params.jobId, isActive: true });
    if (!jobListing) return res.status(404).json({ message: "Job not found" });

    const payload = {
      job: buildJobPayload(jobListing),
      profile: buildStudentPayload(profile)
    };

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/roadmap`, payload);
    
    if (aiResponse.data.error) {
      return res.status(400).json({ message: aiResponse.data.error });
    }
    
    res.json(aiResponse.data);

  } catch (error) {
    console.error("AI Roadmap Error:", error.message);
    res.status(500).json({ message: "Failed to generate roadmap", error: error.message });
  }
});

const Application = require("./models/Application");

// ------ Application Tracker (Kanban) Routes ------

app.get("/api/applications", protect, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).sort({ dateApplied: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

app.post("/api/applications", protect, async (req, res) => {
  try {
    const { jobTitle, company, jobId, status } = req.body;
    const newApp = await Application.create({
      user: req.user.id,
      jobTitle,
      company,
      jobId,
      status: status || "Applied"
    });
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ message: "Failed to create application entry" });
  }
});


app.put("/api/applications/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    let appRecord = await Application.findById(req.params.id);
    
    if (!appRecord) return res.status(404).json({ message: "Application not found" });
    if (appRecord.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

    appRecord.status = status;
    await appRecord.save();
    res.json(appRecord);
  } catch (error) {
    res.status(500).json({ message: "Failed to update application" });
  }
});

app.delete("/api/applications/:id", protect, async (req, res) => {
  try {
    let appRecord = await Application.findById(req.params.id);
    
    if (!appRecord) return res.status(404).json({ message: "Application not found" });
    if (appRecord.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

    await appRecord.deleteOne();
    res.json({ message: "Application removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove application" });
  }
});

const authRoutes = require("./routes/authRoutes");
const jobListingRoutes = require("./routes/jobListingRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin/jobs", jobListingRoutes);

const profileRoutes = require("./routes/profileRoutes");

app.use("/api/profile", profileRoutes);

app.use("/uploads", express.static("uploads"));
