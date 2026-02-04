const mongoose = require('mongoose');

const personalityQuesSchema = new mongoose.Schema({
    question: { type: String },
    relatedTo: { type: String },
    options: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true
});

module.exports = mongoose.model('naavi_personality_ques', personalityQuesSchema);