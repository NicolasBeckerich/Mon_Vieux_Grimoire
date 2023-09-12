const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findById(req.params.id)
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};