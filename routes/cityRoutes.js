const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');

router.get('/', cityController.getCities);
router.post('/', cityController.createCity);

module.exports = router;