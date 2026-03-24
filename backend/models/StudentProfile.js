const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  cgpa: Number,

  skills: [String],

  interests: [String],

  internships: [String],

  certifications: [String],

  bio: [String],

  resume: [String]

});

module.exports = mongoose.model("StudentProfile", profileSchema);