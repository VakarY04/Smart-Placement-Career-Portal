const bcrypt = require("bcryptjs");
const JobListing = require("../models/JobListing");
const User = require("../models/User");
const defaultJobListings = require("../data/defaultJobListings");

const SEED_ADMIN_EMAIL = "seed-admin@career-portal.local";
const SEED_ADMIN_NAME = "Career Portal Seed Admin";
const SEED_ADMIN_PASSWORD = "SeedAdmin@123";

async function ensureSeedAdmin() {
  let adminUser = await User.findOne({ role: "ADMIN" });

  if (adminUser) {
    return adminUser;
  }

  adminUser = await User.findOne({ email: SEED_ADMIN_EMAIL });
  if (adminUser) {
    if (adminUser.role !== "ADMIN") {
      adminUser.role = "ADMIN";
      await adminUser.save();
    }
    return adminUser;
  }

  const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  return User.create({
    name: SEED_ADMIN_NAME,
    email: SEED_ADMIN_EMAIL,
    password: hashedPassword,
    role: "ADMIN",
  });
}

async function seedDefaultJobListings() {
  const adminUser = await ensureSeedAdmin();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const listing of defaultJobListings) {
    const existingListing = await JobListing.findOne({
      title: listing.title,
      company: listing.company,
    });

    if (existingListing) {
      existingListing.description = listing.description;
      existingListing.requiredSkills = listing.requiredSkills;
      existingListing.cgpaThreshold = listing.cgpaThreshold;
      existingListing.isActive = true;
      if (!existingListing.createdBy) {
        existingListing.createdBy = adminUser._id;
      }
      await existingListing.save();
      updatedCount += 1;
      continue;
    }

    await JobListing.create({
      ...listing,
      createdBy: adminUser._id,
      isActive: true,
    });
    insertedCount += 1;
  }

  return {
    seeded: insertedCount > 0,
    insertedCount,
    updatedCount,
    totalDefaults: defaultJobListings.length,
  };
}

module.exports = { seedDefaultJobListings };
