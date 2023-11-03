// routes/mainRoutes.js
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const addCurrencyController = require('../controllers/addCurrencyController');

router.get('/v1', mainController.getHello);
router.post('/create-user', mainController.createUser);


router.post('/add-currency', addCurrencyController.addCurrency)

module.exports = router;
