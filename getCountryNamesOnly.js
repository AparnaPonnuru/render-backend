const fs = require('fs');
const path = require('path');

const countriesPath = path.join(__dirname, 'data', 'countries.json');
const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));

const countryNames = countriesData.map(country => ({
  name: country.name.common
}));

fs.writeFileSync(path.join(__dirname, 'data', 'countriesNameOnly.json'), JSON.stringify(countryNames, null, 2), 'utf-8');
console.log('Created data/countriesNameOnly.json with only country names.');
