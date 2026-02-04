const { findOneAndUpdate } = require('../models/path.model');
const userModel = require('../models/users.model');
const axios = require('axios');
const userPersonalityModel = require('../models/userPersonalityAns.model')

const addUser = async (req, res) => {
    try {
        // Find the user by email
        let user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            return res.json({
                status: false,
                message: 'User not found during profile update',
            });
        }

        // Update the user with provided fields
        user.name = req.body.name || user.name;
        user.country = req.body.country || user.country;
        user.state = req.body.state || user.state;
        user.city = req.body.city || user.city;
        user.postalCode = req.body.postalCode || user.postalCode;
        user.profilePicture = req.body.profilePicture || user.profilePicture;
        user.username = req.body.username || user.username;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        // Check if any required fields are missing
        const requiredFields = [
            user.name,
            user.country,
            user.state,
            user.city,
            user.postalCode,
            user.profilePicture,
            user.username,
            user.phoneNumber,
        ];

        const isProfileComplete = requiredFields.every((field) => field && field.trim() !== '');

        // Save the updated user
        await user.save();

        return res.json({
            status: true,
            message: 'User profile updated successfully',
            data: {
                ...user.toObject(),
                profileIncomplete: !isProfileComplete, // Flag for incomplete profile
            },
        });
    } catch (error) {
        console.error('Error in addUser:', error);
        return res.json({
            status: false,
            message: 'Error in creating or updating user',
        });
    }
};

const getUsers = async (req, res) => { 
    let filter = {};

    // Handle filtering based on the provided query parameters
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all") {
            filter = {}; // If status is 'all', clear the filter
        }
    } else {
        filter.status = "active"; // Default filter to active status
    }

    // Add filter for specific user if username or email is provided
    if (req.query.username) {
        filter.username = req.query.username;  // Filter by username
    }
    if (req.query.email) {
        filter.email = req.query.email;  // Filter by email
    }

    try {
        // Fetch users based on the filter
        const users = await userModel.find(filter);

        // If no users are found, return a message indicating so
        if (users.length === 0) {
            return res.json({
                status: false,
                message: 'No users found matching the criteria',
            });
        }

        // Return the users found
        return res.json({
            status: true,
            message: 'User(s) fetched successfully',
            data: users,
        });
    } catch (error) {
        // Handle error if something goes wrong with the query
        console.error(error);
        return res.json({
            status: false,
            message: 'Error in fetching users',
        });
    }
};


let addMentor = async (req, res) => {
    let userData = await userModel.findOneAndUpdate({ email: req.body.email, status: "active" }, { userType: "mentor" }, { new: true });
    if (!userData) {
        return res.json({
            status: false,
            message: 'Error in updating user',
        })
    }
    if (!userData.userType) {
        return res.json({
            status: false,
            message: 'User is not registered',
        })
    }
    return res.json({
        status: true,
        message: 'User updated as mentor',
        data: userData
    })
}

//Update user level3 status
let updateUser = async (req, res) => {
    let userData = await userModel.findOne({ _id: req.body.userId, status: "active" });
    if (!userData) {
        return res.json({
            status: false,
            message: "user not found"
        })
    }
    // console.log(userData.user_level)
    if (userData?.user_level >= 2) {
        let findUserAnswers = await userPersonalityModel.find({ userId: req.body.userId, status: "active" })
        if (!findUserAnswers) {
            return res.json({
                status: false,
                message: "user not updated to level 2",
            })
        }

        if (findUserAnswers.length !== 48) {
            return res.json({
                status: false,
                message: "All 48 questions needs to be answered",
            })
        }

        const pointsByCategory = {};

        findUserAnswers.forEach(question => {
            const { relatedTo, points } = question;
            pointsByCategory[relatedTo] = (pointsByCategory[relatedTo] || 0) + points;
        });

        // Convert the accumulated points to an array of objects
        const result = Object.entries(pointsByCategory).map(([relatedTo, points]) => ({
            relatedTo,
            points,
        }));


        const maxPointsObject = result.reduce((maxObject, currentObject) =>
            currentObject.points > maxObject.points ? currentObject : maxObject
        );


        let updateUserData = await userModel.findOneAndUpdate({ _id: req.body.userId, status: "active" }, { personality: maxPointsObject.relatedTo, user_level: 3 }, { new: true })
        if (updateUserData) {
            return res.json({
                status: true,
                message: "user updated",
                data: updateUserData
            })
        }
    } else {
        return res.json({
            status: false,
            message: "user level 2 data not updated"
        })
    }
}


module.exports = {
    addUser,
    getUsers,
    addMentor,
    updateUser
}