const mongoose = require('mongoose');

const personalityQuesSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId },
    question: { type: String },
    answer: { type: String },
    points: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true
});

module.exports = mongoose.model('career_user_answers', personalityQuesSchema);