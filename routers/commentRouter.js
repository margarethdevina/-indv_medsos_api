const router = require('express').Router();
const { readToken } = require('../config/encryption');
const { commentController } = require('../controllers');

router.get('/get', commentController.getData);
router.get('/paginate', commentController.paginate);
router.post('/add', readToken, commentController.add);
router.patch('/:id', readToken, commentController.edit);
router.delete('/:id', readToken, commentController.delete);

module.exports = router;