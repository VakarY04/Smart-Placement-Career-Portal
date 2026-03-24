const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createProfile,
  getMyProfile,
  updateProfile
} = require("../controllers/profileController");

router.post("/create", protect, createProfile);

router.get("/me", protect, getMyProfile);

router.put("/update", protect, updateProfile);

module.exports = router;