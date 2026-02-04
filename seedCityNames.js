require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Adjust model path as needed!
const City = require('./models/city');

const cityNamesPath = path.join(__dirname, 'data', 'cityNamesOnly.json');
const cityNames = JSON.parse(fs.readFileSync(cityNamesPath, 'utf-8'));

const database_url = process.env.DATABASE_URI;

mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
  try {
    // Optional: Clear old cities
    await City.deleteMany({});

    // Insert cities as { name: "CityName" }
    for (const name of cityNames) {
      await City.create({ name });
    }

    console.log("✅ City names imported!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during city import:", err);
    process.exit(1);
  }
});
