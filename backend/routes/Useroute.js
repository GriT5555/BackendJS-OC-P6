const express = requre('express');
const router = express.Router();
const userCtrl = require('../controllers/Userctrl');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;