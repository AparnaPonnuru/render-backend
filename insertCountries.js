// seedCountries.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Country = require('./models/country');

const countriesPath = path.join(__dirname, 'data', 'countriesNameOnly.json'); // your simple country names list
const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));

const database_url = process.env.DATABASE_URI; // your .env must have DATABASE_URI

mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
  try {
    await Country.deleteMany({}); // Remove old data

    // Insert as { name: { common, official } }
    for (const c of countriesData) {
      await Country.create({
        name: { common: c.name, official: c.name }
      });
    }

    console.log("✅ Countries seeded as { name: { common, official } } format!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
});
