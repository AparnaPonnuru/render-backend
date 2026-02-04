const preLoginModel = require("../models/preLogin.model")
const userPathModel = require("../models/userpaths.model")


const storePreLogin = async (req, res) => {
    let storePath = {
        email: req.body.email,
        pathId: req.body.pathId,
        grade: req.body.grade,
        gradePointAvg: req.body.gradePointAvg,
        stream: req.body.stream,
        curriculum: req.body.curriculum,
        financialPosition: req.body.financialPosition
    }
    let preLoginData = await preLoginModel.create(storePath)
    if (!preLoginData) {
        return res.json({
            status: false,
            message: 'Error in storing data',
            preLoginData
        })
    }
    return res.json({
        status: true,
        message: 'User Path created',
        data: preLoginData
    })
}


const getPreLoginPath = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.email) filter.email = req.query.email;

    let checkUserPath = await userPathModel.findOne({ email: req.query.email })
    if (checkUserPath) {
        return res.json({
            status: false,
            message: "This person has already selected a path"
        })
    }

    preLoginModel.find(filter, { email: 1, pathId: 1, createdAt: -1, status: 1 }).then(loginData => {
        if (loginData.length === 0) {
            return res.json({
                status: false,
                message: 'No data found',
            })
        }
        return res.json({
            status: true,
            total: loginData.length,
            message: 'pre-login data fetched',
            data: loginData
        })
    }).catch(err => {
        console.log('err=========>', err);
        res.json({
            status: false,
            message: err.message
        });
    })
}


const getCoordinates = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.email) filter.email = req.query.email;

    let checkUserPath = await userPathModel.findOne({ email: req.query.email })
    if (checkUserPath) {
        return res.json({
            status: false,
            message: "This person has already selected a path"
        })
    }

    preLoginModel.find(filter, { pathId: 0 }, { createdAt: -1 }).then(loginData => {
        if (loginData.length === 0) {
            return res.json({
                status: false,
                message: 'No data found',
            })
        }
        return res.json({
            status: true,
            total: loginData.length,
            message: 'pre-login data fetched',
            data: loginData
        })
    }).catch(err => {
        console.log('err=========>', err);
        res.json({
            status: false,
            message: err.message
        });
    })
}

module.exports = {
    storePreLogin,
    getPreLoginPath,
    getCoordinates
}