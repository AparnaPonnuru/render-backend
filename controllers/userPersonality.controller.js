const userPersonalityModel = require("../models/userPersonalityAns.model");


const addAnswer = async (req, res) => {
    let addUserAnswer = {
        userId: req.body.userId,
        question: req.body.question,
        answer: req.body.answer,
        
    }
    let userPoints
    if (req.body.answer.toLowerCase() === "dislike") {
        userPoints = 0
    }
    if (req.body.answer.toLowerCase() === "slightly dislike") {
        userPoints = 1
    }
    if (req.body.answer.toLowerCase() === "neutral") {
        userPoints = 2
    }
    if (req.body.answer.toLowerCase() === "slightly enjoy") {
        userPoints = 3
    }
    if (req.body.answer.toLowerCase() === "enjoy") {
        userPoints = 4
    }

    addUserAnswer = { ...addUserAnswer, points: userPoints }

    let checkAnswer = await userPersonalityModel.findOne({ ...addUserAnswer, status: "active" })
    if (checkAnswer) {
        return res.json({
            statys: false,
            message: "Question has been already answered"
        })
    }
    let addData = await userPersonalityModel.create(addUserAnswer);
    if (!addData) {
        return res.json({
            status: false,
            message: 'Error in adding answer',
        })
    }
    return res.json({
        status: true,
        message: 'Answer added',
        data: addData
    })
}

const getAnswers = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.question) filter.question = req.query.question;
    if (req.query.answer) filter.answer = req.query.answer;
    if (req.query.relatedTo) filter.relatedTo = req.query.relatedTo;
    let answersData = await userPersonalityModel.find(filter)
    if (answersData.length > 0) {
        return res.json({
            status: true,
            message: "data fetched",
            total: answersData.length,
            data: answersData
        })
    } else {
        return res.json({
            status: false,
            message: "data not found"
        })
    }
}


module.exports = {
    addAnswer,
    getAnswers
}