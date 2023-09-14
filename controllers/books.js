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

exports.modifyBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }

            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non-autorisé' });
            }

            let bookObject;

            if (req.file) {
                bookObject = {
                    ...JSON.parse(req.body.book),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                };

                const fileToDelete = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${fileToDelete}`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la suppression de l'ancienne image :", err);
                        return res.status(500).json({ error: "Erreur lors de la suppression de l'ancienne image" });
                    }

                    updateBook(bookObject, req, res);
                });

            } else {
                bookObject = { ...req.body };
                updateBook(bookObject, req, res);
            }

        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

function updateBook(bookObject, req, res) {
    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
}


exports.addRating = (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.body.userId;
    const grade = req.body.rating;

    if (grade < 0 || grade > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }

            const userRating = book.ratings.find(rating => rating.userId === userId);
            if (userRating) {
                return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre." });
            }

            book.ratings.push({ userId, grade });

            const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;

            book.save()
                .then(() => res.status(200).json({ message: 'Note ajoutée avec succès !', book }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};