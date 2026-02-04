const State = require('../models/state');

exports.getStates = async (req, res) => {
  try {
    const { countryId } = req.query;
    const query = countryId ? { countryId } : {};
    const states = await State.find(query).sort({ name: 1 });
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createState = async (req, res) => {
  try {
    const { name, countryId } = req.body;
    const state = await State.create({ name, countryId });
    res.status(201).json(state);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
