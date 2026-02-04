const Country = require('../models/country');

exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ 'name.common': 1 });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCountry = async (req, res) => {
  try {
    const { name, cca2 } = req.body;
    const country = await Country.create({ name, cca2 });
    res.status(201).json(country);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
