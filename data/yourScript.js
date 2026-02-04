const fs = require('fs');
const path = require('path');

const allData = require('./all.json'); // Use the full file from Yerikmiller or your copy

const flatCities = [];

allData.forEach(country => {
  const countryName = country.name;
  const countryIso2 = country.iso2;
  if (country.states) {
    country.states.forEach(state => {
      const stateName = state.name;
      const stateCode = state.state_code;
      if (state.cities) {
        state.cities.forEach(cityName => {
          flatCities.push({
            countryName,
            countryIso2,
            stateName,
            stateCode,
            cityName
          });
        });
      }
    });
  }
});

fs.writeFileSync('flatCities.json', JSON.stringify(flatCities, null, 2));
console.log(`Done! Found ${flatCities.length} cities.`);
