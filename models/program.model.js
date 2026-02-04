const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Unique ID for each step
  name: String,
  description: String,
});

const ProgramSchema = new mongoose.Schema({
  school: { type: String, required: true },
  program: { type: String, required: true },
  description: { type: String, required: true },
  grade: { type: String, required: true },
  curriculum: { type: String, required: true },
  stream: { type: String, required: true },
  performance: { type: String, required: true },
  financialSituation: { type: String, required: true },
  personality: { type: String, required: true },
  country: { type: String, required: true }, // ✅ NEW FIELD
  steps: [StepSchema], // Store steps as subdocuments with IDs
});

const Program = mongoose.model('Program', ProgramSchema);

module.exports = Program;
