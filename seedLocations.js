require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const Country = require('./models/country');
const State = require('./models/state');
const City = require('./models/city');

// JSON data files (change path if your files are in another folder)
const countriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'countries.json')));
const statesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'flatStates.json')));
const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'flatCities.json')));

const database_url = process.env.DATABASE_URI;

mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
  try {
    // Clear previous data (optional step if you want a fresh import)
    await Country.deleteMany({});
    await State.deleteMany({});
    await City.deleteMany({});

    // Insert Countries
    const countryIdMap = {}; // map cca2/iso2 code to db _id
    for (const c of countriesData) {
      const doc = await Country.create({
        name: c.name,
        cca2: c.cca2 || c.iso2
      });
      countryIdMap[c.cca2 || c.iso2] = doc._id.toString();
    }

    // Insert States
    const stateIdMap = {};
    for (const s of statesData) {
      const countryId = countryIdMap[s.countryIso2];
      const doc = await State.create({
        name: s.stateName,
        countryId
      });
      stateIdMap[s.stateCode + '_' + s.countryIso2] = doc._id.toString();
    }

    // Insert Cities
    for (const c of citiesData) {
      const countryId = countryIdMap[c.countryIso2];
      const stateId = stateIdMap[c.stateCode + '_' + c.countryIso2];
      await City.create({
        name: c.cityName,
        countryId,
        stateId
      });
    }

    console.log("✅ Seeder import finished!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
});
