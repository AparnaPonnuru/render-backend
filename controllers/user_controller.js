const userModel = require('../models/users.model'); // Your User model for saving profil
// Controller to add or update profile data
const addUserProfile = async (req, res) => {
    try {
        // Check if the user already exists by email
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            // User exists, update missing profile fields
            let profileUpdated = false;

            // Update profile details if not present
            const fieldsToUpdate = [
                'name', 'country', 'state', 'city', 
                'postalCode', 'profilePicture', 
                'username', 'phoneNumber'
            ];

            fieldsToUpdate.forEach(field => {
                if (!user[field]) {
                    user[field] = req.body[field];
                    profileUpdated = true;
                }
            });

            // Directly set user level to 1 and profileComplete to true if not already set
            if (!user.profileComplete) {
                user.user_level = 1; // Set user_level to 1
                user.profileComplete = true; // Mark profile as complete
                profileUpdated = true;
            }

            // Save updated user details if any field was modified
            if (profileUpdated) {
                await user.save();
                console.log('User profile updated:', user);  // Debugging line
                return res.json({
                    status: true,
                    message: 'Profile details added successfully',
                    data: user,
                });
            } else {
                return res.json({
                    status: true,
                    message: 'Profile is already complete',
                    data: user,
                });
            }
        } else {
            // Create a new user if not found
            const newUser = new userModel({
                email: req.body.email,
                name: req.body.name,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                postalCode: req.body.postalCode,
                profilePicture: req.body.profilePicture,
                username: req.body.username,
                phoneNumber: req.body.phoneNumber,
                user_level: 1, // Set user level to 1
                profileComplete: true, // Mark profile as complete
            });

            await newUser.save();
            console.log('New user created:', newUser);  // Debugging line
            return res.json({
                status: true,
                message: 'User created successfully',
                data: newUser,
            });
        }
    } catch (err) {
        console.error('Error in addUserProfile:', err);
        return res.json({
            status: false,
            message: 'Error in adding user profile',
        });
    }
};



// Controller to fetch user profile details
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.params.email });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        // Define required fields for profile completeness
        const requiredFields = [
            user.name,
            user.country,
            user.state,
            user.city,
            user.postalCode,
            user.profilePicture,
            user.phoneNumber,
        ];

        // Check if all required fields are filled
        const isProfileComplete = requiredFields.every((field) => field && field.trim() !== '');

        return res.json({
            status: true,
            data: {
                ...user._doc, // Spread other user fields
                user_level: user.user_level || 0, // Include user_level in response
            },
            profileComplete: isProfileComplete,
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return res.status(500).json({
            status: false,
            message: 'Error in fetching user details',
        });
    }
};  

const updateLevelTwoProfile = async (req, res) => {
    try {
        // Extract the user ID from the request parameters
        const { profileDataId } = req.params;

        // Extract Level 2 fields from the request body
        const {
            financialSituation,
            school,
            performance,
            curriculum,
            stream,
            grade,
            linkedin,
        } = req.body;

        // Find the user by ID
        const user = await userModel.findById(profileDataId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Update Level 2 fields
        let profileUpdated = false;

        const levelTwoFields = {
            financialSituation,
            school,
            performance,
            curriculum,
            stream,
            grade,
            linkedin,
        };

        Object.keys(levelTwoFields).forEach((field) => {
            if (levelTwoFields[field] && user[field] !== levelTwoFields[field]) {
                user[field] = levelTwoFields[field];
                profileUpdated = true;
            }
        });

        // If Level 2 fields are updated, set user_level to 2
        if (profileUpdated) {
            user.user_level = 2; // Update the user level to 2
            await user.save();

            return res.json({
                status: true,
                message: "Level 2 details updated successfully",
                data: user,
            });
        }

        return res.json({
            status: true,
            message: "No changes detected for Level 2 details",
            data: user,
        });
    } catch (error) {
        console.error("Error in updateLevelTwoProfile:", error);
        return res.status(500).json({
            status: false,
            message: "Error in updating Level 2 details",
        });
    }
};

const addPersonality = async (req, res) => {
    const { userId, personality } = req.body; // Get userId and personality from the request body
  
    // Ensure personality is valid
    const validPersonalities = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    if (!validPersonalities.includes(personality)) {
      return res.status(400).json({ status: false, message: 'Invalid personality type' });
    }
  
    try {
      // Find the user by userId
      const user = await userModel.findById(userId);
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      // Update the user's personality field
      user.personality = personality;
      user.user_level = 3;
      await user.save(); // Save the updated user data
  
      // Respond with success
      return res.status(200).json({ status: true, message: 'Personality data added successfully' });
    } catch (error) {
      console.error('Error in addPersonality:', error);
      return res.status(500).json({ status: false, message: 'Server error' });
    }
  };
  


module.exports = {
    addUserProfile,
    getUserProfile,
    updateLevelTwoProfile,
    addPersonality,
};
