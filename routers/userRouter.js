const router = require('express').Router();
const { userController } = require('../controllers');

router.get('/get', userController.getData);
router.post('/login', userController.login);
router.post('/keep', userController.keepLogin);
router.patch('/edit', userController.edit);

module.exports = router;