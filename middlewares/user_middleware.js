// // const axios = require("axios");
// // const uniqid = require('uniqid');
// // const { v4: uuidv4 } = require('uuid');

// const db = require('./db_Operations_middleware');
// const { ObjectId } = require('mongodb');
// const userModel = require('../models/users.model');

// const {
//     affiliate_system,
//     gx_apps_profile,
//     naavi_users

// } = require("../config");


// const getDateTime = () => {
//     return new Promise((resolve, reject) => {
//         let date = new Date();
//         date = date.toLocaleString("en-US", { timeZone: "America/New_York" });
//         let timestamp = Date.now();

//         return resolve({ date, timestamp });
//     })
// }

// const CreateUserProfile = async (bodyObj) => {
//     try {
//         let data = bodyObj;
//         let checkuser = await userModel.findOne({ email: bodyObj.email });
    
//         if (!checkuser) {
//             return res.json({
//                 status: false,
//                 message: 'Error in update Profile',
//             })
//         }

//     // email: { type: String },
//     // name: { type: String },
//     // country: { type: String },
//     // state: { type: String },
//     // city: { type: String },
//     // postalCode: { type: String },
//     // profilePicture: { type: String },
//     // username: { type: String },
//     // userType: { type: String, enum: ['mentor', 'user'], default: 'user' },
//     // status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//         let {
//             email,
//             name,
//             country,
//             state,
//             city,
//             postalCode,
//             profilePicture,
//             username,
//             phoneNumber
//         } = data;

//         let {
//             date,
//             timestamp
//         } = await getDateTime();

//         //all the fields are mandatory
//         const requiredFields = [
//             ["email", email],
//             ["name", name]
//         ];

//         // const missingFields = requiredFields.filter(([key, value]) => !value).map(([key]) => key);
//         // if (missingFields.length > 0) { throw { message: `Missing requireds fields: ${missingFields.join(', ')}`, }; }

//         checkuser.email=email;
//         checkuser.name=name;
//         checkuser.country=country;
//         checkuser.state=state;
//         checkuser.city=city;
//         checkuser.postalCode=postalCode;
//         checkuser.profilePicture=profilePicture;
//         checkuser.phoneNumber=phoneNumber;
//         checkuser.user_level= 1;
//         checkuser.financialSituation= null;
//         checkuser.school= null;
//         checkuser.performance= null;
//         checkuser.curriculum= null;
//         checkuser.stream= null;
//         checkuser.grade= null;
//         checkuser.linkedin= null;
//         checkuser.status= "active";
        
//         checkuser.save();

//         if (checkuser.status) {
//             return {
//                 status: true,
//                 message: "Successfull Created User profile",
//                 checkuser
//             }
//         }
//         else {
//             return {
//                 status: false,
//                 message: "Something went wrong"
//             }
//         }
//     }
//     catch (err) {
//         return {
//             status: false,
//             message: err.message
//         }
//     }
// }

// const AddUserProfile = (bodyObj) => {
//     return new Promise(async function (resolve, reject) {
//         try {
//             let data = bodyObj;
//             let result = await CreateUserProfile(data)
//             if (result.status) {
//                 resolve(result)
//             }
//             else {
//                 reject(result)
//             }
//         } catch (err) {
//             reject({
//                 status: false,
//                 message: err.message
//             });
//         }
//     })
// }

// // const GetAllUserProfiles = (queryObj) => {
// //     return new Promise(async function (resolve, reject) {
// //         try {
// //             let condObj = {
// //                 ...queryObj.condObj
// //             };
// //             let projectObj = {
// //                 ...queryObj.projectObj
// //             }
// //             let sortObj = {
// //                 createdAt: -1
// //             };
        
// //             let result = await db.getAllRecord(naavi_users, condObj, projectObj, sortObj)

// //             if (result.data.length > 0) {
// //                 resolve({
// //                     status: true,
// //                     data: result.data
// //                 })
// //             }
// //             else {
// //                 reject({
// //                     status: false,
// //                     message: "No profiles found"
// //                 })
// //             }
// //         } catch (err) {
// //             reject({
// //                 status: false,
// //                 message: err.message
// //             });
// //         }
// //     })
// // }


// const UpdateUserProfile = (bodyObj) => {
//     return new Promise(async function (resolve, reject) {
//         try {
//             //take _id from params 

//             let condObj = {
//                 _id: new ObjectId(bodyObj.params.id),
//                 status: "active"
//             }
//             let appProfileExist = await db.getRecord(naavi_users, condObj, {});
//             appProfileExist = appProfileExist.data;
//             if (!appProfileExist) throw ({ message: 'User profile does not exist!!' })

//             let { date, timestamp } = await getDateTime();

//             let updateObj = { updatedAt: timestamp }
//             // email,
//             // name,
//             // country,
//             // state,
//             // city,
//             // postalCode,
//             // profilePicture,
//             // username,
//             // userType,
//             // phoneNumber,
//             // financialSituation:null,
//             // school:null,
//             // performance:null,
//             // curriculum:null,
//             // stream:null,
//             // grade:null,
//             // linkedin:null,

//             if (bodyObj.body.email) { updateObj = { ...updateObj, email: bodyObj.body.email } }
//             if (bodyObj.body.name) { updateObj = { ...updateObj, name: bodyObj.body.name } }
//             if (bodyObj.body.country) { updateObj = { ...updateObj, country: bodyObj.body.country } }
//             if (bodyObj.body.state) { updateObj = { ...updateObj, state: bodyObj.body.state } }
//             if (bodyObj.body.city) { updateObj = { ...updateObj, city: bodyObj.body.city } }
//             if (bodyObj.body.postalCode) { updateObj = { ...updateObj, postalCode: bodyObj.body.postalCode } }
//             if (bodyObj.body.profilePicture) { updateObj = { ...updateObj, profilePicture: bodyObj.body.profilePicture } }
//             if (bodyObj.body.username) { updateObj = { ...updateObj, username: bodyObj.body.username } }
//             if (bodyObj.body.userType) { updateObj = { ...updateObj, userType: bodyObj.body.userType } }
//             if (bodyObj.body.phoneNumber) { updateObj = { ...updateObj, phoneNumber: bodyObj.body.phoneNumber } }
//             if (bodyObj.body.financialSituation) { updateObj = { ...updateObj, financialSituation: bodyObj.body.financialSituation } }
//             if (bodyObj.body.school) { updateObj = { ...updateObj, school: bodyObj.body.school } }
//             if (bodyObj.body.performance) { updateObj = { ...updateObj, performance: bodyObj.body.performance } }
//             if (bodyObj.body.curriculum) { updateObj = { ...updateObj, curriculum: bodyObj.body.curriculum } }
//             if (bodyObj.body.stream) { updateObj = { ...updateObj, stream: bodyObj.body.stream } }
//             if (bodyObj.body.grade) { updateObj = { ...updateObj, grade: bodyObj.body.grade } }
//             if (bodyObj.body.linkedin) { updateObj = { ...updateObj, linkedin: bodyObj.body.linkedin } }

//             // financialSituation:null,
//             // school:null,
//             // performance:null,
//             // curriculum:null,
//             // stream:null,
//             // grade:null,
//             // linkedin:null,
//             //if any of the above fields are present in the body then update the fields user_level: 2
//             if (bodyObj.body.financialSituation || bodyObj.body.school || bodyObj.body.performance || bodyObj.body.curriculum || bodyObj.body.stream || bodyObj.body.grade || bodyObj.body.linkedin) {
//                 updateObj = { ...updateObj, user_level: 2 }
//             }

//             let updateUser = await db.updateRecord(naavi_users, condObj, updateObj)
//             if (updateUser.data.matchedCount != 0) {
//                 resolve({
//                     status: true,
//                     message: 'Updated the User Profile data'
//                 })
//             } else {
//                 reject({
//                     status: false,
//                     message: "User id not found"
//                 })
//             }
//         } catch (err) {
//             reject({
//                 status: false,
//                 message: err.message
//             })
//         }
//     })
// }

// const ChangeUserType = (bodyObj) => {
//     return new Promise(async function (resolve, reject) {
//         try {
//             let condObj = {
//                 _id: new ObjectId(bodyObj.params.id),
//                 status: "active"
//             }
//             let appProfileExist = await db.getRecord(naavi_users, condObj, {});
//             appProfileExist = appProfileExist.data;
//             if (!appProfileExist) throw ({ message: 'User profile does not exist!!' })

//             let { date, timestamp } = await getDateTime();

//             let updateObj = { updatedAt: timestamp }

//             bodyObj.body.userType = "partner"
//             if (bodyObj.body.userType) { updateObj = { ...updateObj, userType: bodyObj.body.userType } }

//             let updateUser = await db.updateRecord(naavi_users, condObj, updateObj)
//             if (updateUser.data.matchedCount != 0) {
//                 resolve({
//                     status: true,
//                     message: 'Updated the User to mentor Profile data'
//                 })
//             } else {
//                 reject({
//                     status: false,
//                     message: "User id not found"
//                 })
//             }
//         } catch (err) {
//             reject({
//                 status: false,
//                 message: err.message
//             })
//         }
//     }
//     )
// }

// const DeleteUserProfiles = (bodyObj) => {
//     return new Promise(async function (resolve, reject) {

//         let condObj = { user_id: bodyObj.query.user_id, status: "active" }

//         let { date, timestamp } = await getDateTime();

//         let updateObj = { updatedAt: timestamp, status: 'inactive' };

//         db.updateRecord(insurance_user_profile, condObj, updateObj).then((result) => {
//             // console.log(result)
//             if (result.data.matchedCount != 0) {
//                 resolve({
//                     status: true,
//                     message: 'Deleted the User profile data'
//                 });
//             } else {
//                 reject({
//                     status: false,
//                     message: "User profile details not found"
//                 })
//             }
//         }).catch((err) => {
//             reject({
//                 status: false,
//                 message: err.message
//             });
//         });
//     });
// };

// module.exports = {
//     AddUserProfile,
    
//     UpdateUserProfile,
//     DeleteUserProfiles,
//     ChangeUserType
// }