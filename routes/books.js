const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const booksCtrl = require('../controllers/books');


router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestBooks);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.post('/:id/rating', auth, booksCtrl.addRating);


module.exports = router;
