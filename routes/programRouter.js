const express = require('express');
const router = express.Router();
const Program = require('../models/program.model');
const University = require('../models/universities.model'); // ✅ correct import

/**
 * ============================
 *  GET /api/userpaths/programs
 *  Fetch Programs with Filters
 * ============================
 */
router.get('/programs', async (req, res) => {
  try {
    const {
      grade,
      curriculum,
      stream,
      performance,
      financialSituation,
      personality,
      country,
    } = req.query;

    // Build query object
    const query = {};

    if (grade) query.grade = new RegExp(grade, 'i');
    if (curriculum) query.curriculum = new RegExp(curriculum, 'i');
    if (stream) query.stream = new RegExp(stream, 'i');
    if (performance) query.performance = new RegExp(performance, 'i');
    if (financialSituation) query.financialSituation = new RegExp(financialSituation, 'i');
    if (personality) query.personality = new RegExp(personality, 'i');

    /**
     * ----------------------------
     *  FILTER BY COUNTRY (optional)
     * ----------------------------
     */
    if (country) {
      const universities = await University.find({
        country: new RegExp(country, 'i'),
      }).select('name');

      const universityNames = universities.map((u) => u.name);

      if (universityNames.length > 0) {
        // Loose matching: try to match first keyword of university name to program's school field
        query.$or = universityNames.map((name) => ({
          school: { $regex: name.split(' ')[0], $options: 'i' },
        }));
      } else {
        console.log(`⚠️ No universities found for ${country}, skipping school filter.`);
      }
    }

    console.log('Query:', query);

    // Fetch matching programs
    let programs = await Program.find(query);

    // Fallback: if no programs found for country, fetch all programs instead
    if (programs.length === 0 && country) {
      console.log(`⚠️ No programs found for ${country}, returning all programs.`);
      programs = await Program.find({});
    }

    res.status(200).json({
      status: true,
      total: programs.length,
      data: programs,
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch programs',
      error: error.message,
    });
  }
});

/**
 * =====================================
 *  GET /api/userpaths/steps?pathId=...
 *  Fetch Steps for a Specific Program
 * =====================================
 */
router.get('/steps', async (req, res) => {
  try {
    const { universityId } = req.query;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'programId is required in query parameters.',
      });
    }

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: program._id,
        school: program.school,
        program: program.program,
        description: program.description,
        steps: program.steps,
      },
    });
  } catch (error) {
    console.error('Error fetching program steps:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});



module.exports = router;
