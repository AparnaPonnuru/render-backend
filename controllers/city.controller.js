const City = require('../models/city');

exports.getCities = async (req, res) => {
  try {
    const { stateId, countryId } = req.query;
    let query = {};
    if (stateId) query.stateId = stateId;
    if (countryId) query.countryId = countryId;
    const cities = await City.find(query).sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { name, stateId, countryId } = req.body;
    const city = await City.create({ name, stateId, countryId });
    res.status(201).json(city);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
