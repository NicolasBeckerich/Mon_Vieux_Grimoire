const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);

module.exports = router;