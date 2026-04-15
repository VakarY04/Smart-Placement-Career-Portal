const express = require("express");
const {
  createJobListing,
  getJobListings,
  updateJobListing,
  deleteJobListing,
  getJobAnalytics,
} = require("../controllers/jobListingController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireRole("ADMIN"));

router.get("/", getJobListings);
router.post("/", createJobListing);
router.get("/analytics", getJobAnalytics);
router.put("/:id", updateJobListing);
router.delete("/:id", deleteJobListing);

module.exports = router;
