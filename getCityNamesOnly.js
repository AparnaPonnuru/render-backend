const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, 'data', 'flatCities.json'); // change filename if different
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

const cityNames = citiesData.map(city => city.cityName);

fs.writeFileSync(path.join(__dirname, 'data', 'cityNamesOnly.json'), JSON.stringify(cityNames, null, 2), 'utf-8');
console.log('Created data/cityNamesOnly.json with only names.');
