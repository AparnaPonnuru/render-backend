const express = require('express');
const router = express.Router();
const stateController = require('../controllers/state.controller');

router.get('/', stateController.getStates);
router.post('/', stateController.createState);

module.exports = router;
