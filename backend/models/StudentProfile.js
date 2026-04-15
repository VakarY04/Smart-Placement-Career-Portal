const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  cgpa: Number,

  collegeName: String,

  skills: [String],

  interests: [String],

  internships: [String],

  experiences: [
    {
      company: String,
      role: String,
      dates: String,
    },
  ],

  certifications: [String],

  bio: [String],

  resume: [String],

  resumeAnalysis: {
    skills: {
      type: [String],
      default: [],
    },
    skillsByCategory: {
      type: Map,
      of: [String],
      default: {},
    },
    ats_score: {
      type: Number,
      default: 0,
    },
    improvement_suggestions: [
      {
        area: String,
        suggestion: String,
        example: String,
      },
    ],
    analyzedAt: Date,
  }

});

module.exports = mongoose.model("StudentProfile", profileSchema);
