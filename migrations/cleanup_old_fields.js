require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");

(async () => {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.DATABASE_URI);
  console.log("Connected");

  console.log("Cleaning old fields...");

  const result = await Universities.updateMany(
    {},
    {
      $unset: {
        grade: 1,
        curriculum: 1,
        stream: 1,
        performance: 1,
        financialSituation: 1,
        personality: 1,
        steps: 1
      }
    },
    {
      strict: false   // 🔥 IMPORTANT — allows removal of undeclared fields
    }
  );

  console.log("Matched:", result.matchedCount);
  console.log("Modified:", result.modifiedCount);
  console.log(`Cleaned ${result.modifiedCount} universities`);

  await mongoose.disconnect();
  process.exit(0);
})();
