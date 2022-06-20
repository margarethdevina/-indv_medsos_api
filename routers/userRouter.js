const router = require('express').Router();
const { readToken } = require('../config/encryption');
const { userController } = require('../controllers');

router.get('/get', userController.getData);
router.post('/regis', userController.register);
router.post('/login', userController.login);
router.get('/keep', readToken, userController.keepLogin);
router.patch('/edit', readToken, userController.edit);
router.patch('/verification', readToken, userController.verification);
router.get('/resendVerif', readToken, userController.resendVerif);
router.post('/forgot', userController.forgotPassword);
router.patch('/reset', readToken, userController.resetPassword);

module.exports = router;