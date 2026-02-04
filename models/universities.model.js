const mongoose = require('mongoose');
const { Schema } = mongoose;

const StepSchema = new Schema({
  name: String,
  description: String
}, { _id: true });  // ✅ allow step-level _id

const UniversitySchema = new Schema({
  name: String,
  country: String,
  "state-province": String,
  web_pages: [String],
  domains: [String],

  generatedProgram: {
    program: String,
    description: String,
    grade: String,
    curriculum: String,
    stream: String,
    performance: String,
    financialSituation: String,
    personality: String,
    steps: [StepSchema], // now each step has _id
    generatedAt: Date
  }
});

module.exports = mongoose.model("Universities", UniversitySchema);
