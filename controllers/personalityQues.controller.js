// controllers/personalityQuestions.controller.js
const PersonalityQuestion = require('../models/personalityQues.model'); // Adjust path as needed

// Controller function to fetch all questions from the database
const getQuestions = async (req, res) => {
    try {
        // Fetch all questions that are 'active'
        const questions = await PersonalityQuestion.find({ status: 'active' });

        // Check if no questions are found
        if (questions.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No active questions found',
            });
        }

        // Return the fetched questions
        return res.json({
            status: true,
            message: 'Questions fetched successfully',
            data: questions,
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
            status: false,
            message: 'Error fetching questions from the database',
        });
    }
};

module.exports = {
    getQuestions,
};
