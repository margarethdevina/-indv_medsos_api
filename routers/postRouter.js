const router = require('express').Router();
const { readToken } = require('../config/encryption');
const { postController } = require('../controllers');

router.get('/get', postController.getData);
router.get('/detail', postController.detail);
router.post('/add', readToken, postController.add);
router.patch('/:id', readToken, postController.edit);
router.delete('/:id', readToken, postController.delete);

module.exports = router;

//createToken({ id, username, email, status, role, fullname, bio, profilePicture });
//token cuma boleh dibaca aja di bagian post dan comment, yg createToken cm di user controller register, login, keeplogin, edit.
//hover method axios di FE, cek strukturnya
//get sama dengan delete, url baru config
//post dan patch sama, url, data, config