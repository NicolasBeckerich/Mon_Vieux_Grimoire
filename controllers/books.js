const Book = require('../models/Book');
const fs = require('fs');

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

exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => {
          fs.unlink(`images/${req.file.filename}`, () => {
              res.status(400).json({ error });
          });
      });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
  .then(book => {
    
      if (book.userId.toString() !== req.auth.userId) {
          return res.status(401).json({ message : 'Non-autorisé'});
      }

      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (err) => {
          if (err) {
              return res.status(500).json({ error: 'Erreur suppression image' });
          }

          Book.deleteOne({_id: req.params.id})
          .then(() => { 
              res.status(200).json({message: 'Livre supprimé !'})
          })
          .catch(error => res.status(500).json({ error }));
      });
  })
  .catch(error => { 
      res.status(500).json({ error });
  });
};