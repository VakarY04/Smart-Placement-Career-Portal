require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Resource = require("../models/Resource");
const defaultResources = require("../data/defaultResources");

async function seedResources() {
  let insertedCount = 0;
  let updatedCount = 0;

  for (const resource of defaultResources) {
    const existingResource = await Resource.findOne({ slug: resource.slug });

    if (existingResource) {
      existingResource.title = resource.title;
      existingResource.url = resource.url;
      existingResource.platform = resource.platform;
      existingResource.difficulty = resource.difficulty;
      existingResource.topics = resource.topics || [];
      await existingResource.save();
      updatedCount += 1;
      continue;
    }

    await Resource.create(resource);
    insertedCount += 1;
  }

  return {
    seeded: insertedCount > 0,
    insertedCount,
    updatedCount,
    totalDefaults: defaultResources.length,
  };
}

async function runSeedResources() {
  await connectDB();
  const result = await seedResources();
  console.log(
    `Resources synced. Inserted: ${result.insertedCount}, updated: ${result.updatedCount}, total defaults: ${result.totalDefaults}.`
  );
  await mongoose.connection.close();
}

if (require.main === module) {
  runSeedResources().catch(async (error) => {
    console.error("Failed to seed resources:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  });
}

module.exports = { seedResources };
