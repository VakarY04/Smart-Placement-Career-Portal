const Profile = require("../models/StudentProfile");

exports.createProfile = async (req, res) => {
  try {

    // Check if profile already exists
    const existingProfile = await Profile.findOne({
      user: req.user.id
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists"
      });
    }

    const profile = await Profile.create({
      user: req.user.id,
      ...req.body
    });

    res.json(profile);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {

    const profile = await Profile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(profile);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(profile);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {

    const profile = await Profile.findOne({
      user: req.user.id
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    profile.resume = req.file.path;

    await profile.save();

    res.json({
      message: "Resume uploaded successfully",
      resumePath: profile.resume
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};