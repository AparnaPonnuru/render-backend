const mongoose = require('mongoose');
const PersonalityQuestion = require('../models/personalityQues.model'); // Adjust the path as needed

const seedQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://adi:AGmChskREizfDNlc@cluster0.o9lpe.mongodb.net/naavi-mock', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Define the questions to seed
        const questions = [
            {
                question: 'Keep shipping and receiving records',
                
            },
            {
                question: 'Handle customers bank transactions',
                
            },
            {
                question: 'Operate a calculator',
                
            },
            {
                question: 'Compute and record statistical and other numerical data',
                
            },
            {
                question: 'Maintain employee records',
                
            },
            {
                question: 'Use a computer pogram to generate customer bills',
                
            },
            {
                question: 'Inventory supplies using a hand-held computer',
                
            },
            {
                question: 'Generate the monthly payroll checks for an office',
                
            },
            {
                question: 'Run a toy store',
                
            },
            {
                question: 'Sell houses',
                
            },
            {
                question: 'Manage a clothing store ',
                
            },
            {
                question: 'Manage a department within a large company',
                
            },
            {
                question: 'Operate a beauty salon or barber shop',
                
            },
            {
                question: 'Manage the operations of a hotel',
                
            },
            {
                question: 'Sell merchandise at a department store',
                
            },
            {
                question: 'Sell restaurant franchises to individuals',
                
            },
            {
                question: 'Help elderly people with their daily activities',
                
            },
            {
                question: 'Teach children how to read',
                
            },
            {
                question: 'Supervise the activities of children at a camp',
                
            },
            {
                question: 'Help people with family-related problems',
                
            },
            {
                question: 'Teach an individual an exercise routine',
                
            },
            {
                question: 'Help people who have problems with drugs or alcohol',
                
            },
            {
                question: 'Do volunteer work at a non-profit organization',
                
            },
            {
                question: 'Give career guidance to people',
                
            },
            {
                question: 'Design sets for plays',
                
            },
            {
                question: 'Perform stunts for a movie or television show',
                
            },
            {
                question: 'Play musical instrument',
                
            },
            {
                question: 'Write books or plays',
                
            },
            {
                question: 'Write a song',
                
            },
            {
                question: 'Design art work for magazines',
                
            },
            {
                question: 'Direct a play',
                
            },
            {
                question: 'Conduct a musical choir',
                
            },
            {
                question: 'Make a map of the bottom of an ocean',
                
            },
            {
                question: 'Work in a biology lab',
                
            },
            {
                question: 'Study whales and other types of marine life',
                
            },
            {
                question: 'Conduct biological research',
                
            },
            {
                question: 'Develop a new medical treatment or procedure',
                
            },
            {
                question: 'Do research on plants or animals',
                
            },
            {
                question: 'Study animal behaviour',
                
            },
            {
                question: 'Study the structure of the human body',
                
            },
            {
                question: 'Install flooring in houses',
                
            },
            {
                question: 'Assemble products in a factory',
                
            },
            {
                question: 'Fix a broken faucet',
                
            },
            {
                question: 'Operate a grinding machine in a factory',
                
            },
            {
                question: 'Assemble electronic parts',
                
            },
            {
                question: 'Work on an offshore oil-drilling rig',
                
            },
            {
                question: 'Lay brick or tile',
                
            },
            {
                question: 'Test the quality of parts before shipment',
                
            },
            
        ];


        // Insert questions into the database
        const result = await PersonalityQuestion.insertMany(questions);
        console.log('Questions inserted:', result);

        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding questions:', error);

        // Ensure the connection is closed on error
        mongoose.connection.close();
    }
};

// Run the seeding function
seedQuestions();
