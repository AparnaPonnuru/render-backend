const mongoose = require('mongoose');

const preLoginSchema = new mongoose.Schema({
    email: { type: String },
    pathId: { type: Object },
    grade:[{ type: String }],
    gradePointAvg: [{ type: String }],
    stream:[{ type: String }],
    curriculum: [{ type: String }],
    financialPosition: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true
});

module.exports = mongoose.model('career_preLogin', preLoginSchema);