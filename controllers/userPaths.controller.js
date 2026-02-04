const pathModel = require('../models/path.model');
const userPathModel = require('../models/userpaths.model');
let mongoose = require("mongoose")

const addUserPath = async (req, res) => {
    let existingUserPath = await userPathModel.findOne({ email: req.body.email, status: "active" });
    if(existingUserPath?.pathId == req.body.pathId){
        return res.json({
            status:false,
            message:"This is the path currently selected"
        })
    }
    if (existingUserPath) {
        let updateUserPath = await userPathModel.findOneAndUpdate({ email: req.body.email, status: "active" }, { pathId: req.body.pathId,completedSteps:[],currentStep:"" }, { new: true });
        return res.json({
            status: true,
            message: 'Path succesfully updated',
            data: updateUserPath
        })
    }

    let existingPath = await pathModel.findOne({ _id: req.body.pathId, status: "active" });
    if (!existingPath) {
        return res.json({
            status: false,
            message: 'Path not found',
        })
    }

    let createPath = {
        email: req.body.email,
        pathId: req.body.pathId
    }
    let path = await userPathModel.create(createPath);
    if (!path) {
        return res.json({
            status: false,
            message: 'Error in creating path',
        })
    }
    return res.json({
        status: true,
        message: 'User Path created',
        data: path
    })
}

const getUserPath = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.email) filter.email = req.query.email;

    userPathModel.aggregate([
        {
            $match: filter
        },
        {
            $sort: { "createdAt": -1 }
        },
        {
            $lookup: {
                from: "paths",
                let: { "pathId": "$pathId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$pathId", "$_id"] },
                                    { $eq: ["$status", "active"] },
                                ],
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "career_steps",
                            let: { "the_ids": "$the_ids.step_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $in: ["$_id", "$$the_ids"] },
                                                { $eq: ["$status", "active"] },
                                            ],
                                        }
                                    }
                                },
                            ],
                            as: "StepDetails"
                        }
                    },
                ],
                as: "PathDetails"
            }
        },
    ])
        .then(userpaths => {
            if (userpaths.length === 0) {
                return res.json({
                    status: false,
                    message: 'No data found',
                })
            }
            return res.json({
                status: true,
                total: userpaths.length,
                message: 'User Paths data found',
                data: userpaths
            })
        }).catch(err => {
            console.log('err=========>', err);
            res.json({
                status: false,
                message: err.message
            });
        });
}


const getCurrentUserPath = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.email) filter.email = req.query.email;
    if (req.query.email) {
        let fetchCurrentStep = await userPathModel.findOne(filter)
        if (fetchCurrentStep.currentStep === "completed") {
            return res.json({
                status: false,
                message: "All the steps have been completed by the user"
            })
        }
        if (!fetchCurrentStep.currentStep) {
            let fetchPathData = await pathModel.findOne({ _id: fetchCurrentStep.pathId, status: "active" })
            let updateCurrentStep = await userPathModel.findOneAndUpdate(filter, { currentStep: fetchPathData.the_ids[0].step_id }, { new: true })
        }
    }

    userPathModel.aggregate([
        {
            $match: filter
        },
        {
            $sort: { "createdAt": -1 }
        },
        {
            $lookup: {
                from: "career_steps",
                let: { currentStepObjectId: { $toObjectId: "$currentStep" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$currentStepObjectId"] },
                                    { $eq: ["$status", "active"] },
                                ],
                            }
                        }
                    },
                ],
                as: "StepDetails"
            }
        }
    ])
        .then(userpaths => {
            if (userpaths.length === 0) {
                return res.json({
                    status: false,
                    message: 'No data found',
                })
            }
            return res.json({
                status: true,
                total: userpaths.length,
                message: 'User Paths data found',
                data: userpaths
            })
        }).catch(err => {
            console.log('err=========>', err);
            res.json({
                status: false,
                message: err.message
            });
        });
}


const completeStep = async (req, res) => {
    let updateData = {}
    try {
        const currentStep = await pathModel.findOne({ pathId: req.body._id, 'the_ids.step_id': req.body.step_id, status: "active" });

        if (currentStep) {
            const currentIndex = currentStep.the_ids.findIndex((item) => item.step_id == req.body.step_id);
            if (currentIndex !== -1 && currentIndex < currentStep.the_ids.length - 1) {
                const nextStepId = currentStep.the_ids[currentIndex + 1].step_id;
                console.log(nextStepId, "nextStep")
                updateData.currentStep = nextStepId
            }
            if (currentIndex === currentStep.the_ids.length - 1) {
                updateData.currentStep = "completed"
            }
        } else {
            res.json({
                status: false,
                message: "Step id not found / does not belong to the selected user path"
            })
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error finding the next step ID');
    }
    updateData = {
        ...updateData,
        $addToSet: { completedSteps: req.body.step_id }
    }
    let updateCompletedStep = await userPathModel.findOneAndUpdate({ email: req.body.email, status: "active" }, updateData, { new: true })
    if (!updateCompletedStep) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Completed Step updated',
        data: updateCompletedStep
    })
}

const failedStep = async (req, res) => {
    const checkStep = await userPathModel.findOne({ email: req.body.email, status: "active" })
    if (checkStep) {
        if (checkStep.completedSteps.includes(req.body.step_id)) {
            return res.json({
                status: false,
                message: "This step has already been completed by the user"
            })
        }
    } else {
        return res.json({
            status: false,
            message: "user not found"
        })
    }

    const pathDetail = await pathModel.findOne({ pathId: req.body._id,'the_ids.step_id': req.body.step_id, status: "active" });
    if (pathDetail) {
        let selectedStepData = pathDetail.the_ids.filter((item) => item.step_id == req.body.step_id)
        let updateData = { pathId: selectedStepData[0].backup_pathId, completedSteps: [], currentStep: "" }
        let updatePath = await userPathModel.findOneAndUpdate({ email: req.body.email, status: "active" }, updateData, { new: true })
        if (updatePath) {
            return res.json({
                success: true,
                message: "user path updated",
                data: updatePath
            })
        }
    } else {
        return res.json({
            status: false,
            message: "step id not found / does not belong to the selected path"
        })
    }
}

const getUserPathbyPartner = async (req, res) => {
    let filter = {}
    if (req.body.status) {
        filter.status = req.body.status;
        if (req.body.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.body.email) filter.email = req.body.email;

    pathModel.aggregate([
        {
            $match: filter
        },
        {
            $sort: { "createdAt": -1 }
        },
        {
            $lookup: {
                from: "userpaths",
                let: { "pathId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$pathId", "$pathId"] },
                                    { $eq: ["$status", "active"] },
                                ],
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "naavi_users",
                            let: { "the_ids": "$email" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$email", "$$the_ids"] },
                                                { $eq: ["$status", "active"] },
                                            ],
                                        }
                                    }
                                },
                            ],
                            as: "UseDetails"
                        }
                    },
                ],
                as: "PathDetails"
            }
        },
        {
            "$project": {
              "_id": 1,
              "nameOfPath": 1,
              "PathDetails._id": 1,
              "PathDetails.UseDetails._id": 1,
              "PathDetails.UseDetails.email": 1,
              "PathDetails.UseDetails.username": 1,
              "PathDetails.createdAt": 1
            }
          }
    ])
        .then(userpaths => {
            if (userpaths.length === 0) {
                return res.json({
                    status: false,
                    message: 'No data found',
                })
            }
            var userdetials=[];
            for(var i=0; i<userpaths.length;i++){
                var userpath= userpaths[i]["PathDetails"];
                for(var j=0;j<userpath.length;j++){
                    var data = {
                        createdAt: userpath[j]["createdAt"],
                        username: userpath[j]["UseDetails"][0]["username"],
                        email: userpath[j]["UseDetails"][0]["email"],
                        nameOfPath: userpaths[i]["nameOfPath"]
                    };
                    userdetials.push(data);    
                }
            }
            return res.json({
                status: true,
                total: userdetials.length,
                message: 'User Paths data found',
                data: userdetials
            })
        }).catch(err => {
            console.log('err=========>', err);
            res.json({
                status: false,
                message: err.message
            });
        });    
}



module.exports = {
    addUserPath,
    getUserPath,
    getCurrentUserPath,
    completeStep,
    failedStep,
    getUserPathbyPartner
}