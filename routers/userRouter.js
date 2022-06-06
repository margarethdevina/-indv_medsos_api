const router = require('express').Router();
const { userController } = require('../controllers');

router.get('/get', userController.getData);
router.get('/login', userController.login);

module.exports = router;