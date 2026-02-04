const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  name: String,
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
});

module.exports = mongoose.model('State', StateSchema);
