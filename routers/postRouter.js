const router = require('express').Router();
const { postController } = require('../controllers');

router.get('/get', postController.getData);
router.get('/detail', postController.detail);
router.post('/add', postController.add);
router.patch('/:id', postController.edit);
router.delete('/:id', postController.delete);

module.exports = router;