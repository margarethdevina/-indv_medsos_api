const router = require('express').Router();
const { commentController } = require('../controllers');

router.get('/get', commentController.getData);
router.get('/paginate', commentController.paginate);
router.post('/add', commentController.add);
router.patch('/:id', commentController.edit);
router.delete('/:id', commentController.delete);

module.exports = router;