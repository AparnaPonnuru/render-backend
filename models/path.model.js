const mongoose = require('mongoose');

const pathSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },

    // 🔥 MAIN NAME FIELD (UI expects nameOfPath)
    nameOfPath: { type: String, required: true },

    // Backward compatibility (old DB stored "name")
    name: { type: String },  

    description: { type: String },

   current_coordinates: {
  grade: [String],
  curriculum: [String],
  stream: [String],
  grade_avg: [String],
  financialSituation: [String],
  personality: String,
  city: String,
  country: String,
},

feature_coordinates: {
  program: String,
  destination_degree: String,
  destination_institution: String,
  path_type: String,
  path_cat: String,
},


    program: { type: String },
    university: [{ type: String }],

    // 🔥 Steps attached to this path
    the_ids: [
      {
        step_id: { type: mongoose.Types.ObjectId, required: true },
        stepName: { type: String },
        stepDescription: { type: String },

        backup_pathId: { type: mongoose.Types.ObjectId, default: null },
        backupPathName: { type: String },
        backupPathDescription: { type: String }
      }
    ],

    // 🔥 Path Type (from UI)
    path_type: {
      type: String,
      enum: ['education', 'career', 'immigration'],
      default: 'education'
    },

    path_cat: {
      type: String,
      enum: ['K12', 'Degree'],
      default: 'K12'
    },

    // 🔥 Filters
    personality: {
      type: String,
      enum: [
        'realistic', 'investigative', 'artistic',
        'social', 'enterprising', 'conventional'
      ]
    },

    destination_degree: { type: String },
    destination_institution: { type: String },

    length: { type: Number },  // Years

    city: { type: String },
    country: { type: String },

    // 🔥 Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'waitingforapproval', 'delete'],
      default: 'waitingforapproval'
    },

    // 🔥 Arrays
    financialSituation: [
      { type: String, enum: ['0-25L', '25L-75L', '75L-3CR', '3CR+', 'Other'] }
    ],

    curriculum: [
      { type: String, enum: ['IB', 'IGCSE', 'CBSE', 'ICSE', 'Nordic'] }
    ],

    grade: [
      { type: String, enum: ['9', '10', '11', '12'] }
    ],

    grade_avg: [
      {
        type: String,
        enum: [
          '0% - 35%',
          '36% - 60%',
          '61% - 75%',
          '76% - 85%',
          '86% - 95%',
          '96% - 100%'
        ]
      }
    ],

    stream: [
      { type: String, enum: ['MPC', 'BIPC', 'CEC', 'MEC', 'HEC'] }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('paths', pathSchema);
