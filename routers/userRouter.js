const router = require('express').Router();
const { readToken } = require('../config/encryption');
const { userController } = require('../controllers');

router.get('/get', userController.getData);
router.post('/regis', userController.register);
router.post('/login', userController.login);
router.get('/keep', readToken, userController.keepLogin);
router.patch('/edit', readToken, userController.edit);
router.get('/forget', userController.forgetPassword);

module.exports = router;