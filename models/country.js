const mongoose = require('mongoose');
const CountrySchema = new mongoose.Schema({
  name: {
    common: String,
    official: String
  },
  cca2: String
});
module.exports = mongoose.model('Country', CountrySchema);
