const mongoose = require('mongoose');
const CitySchema = new mongoose.Schema({
  name: String,
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
});
module.exports = mongoose.model('City', CitySchema);
