const Book = require('../models/Book');
const fs = require('fs');

///////////////////////////////// Récupération de tous les livres //////////////////////////////
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

//////////////////////////// Récupération d'un livre par son ID /////////////////////////////
exports.getOneBook = (req, res, next) => {
    Book.findById(req.params.id)
        .then(book => res.status(200).json(book)) 
        .catch(error => res.status(404).json({ error }));
};

///////////////////////////////// Création d'un nouveau livre ////////////////////////////////
exports.createBook = (req, res) => {
    // Traitement du livre reçu (objet)
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Création du livre 
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Sauvegarde du livre dans la base de données
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => {
            // Si il y'a une erreur on supprime l'image
            fs.unlink(`images/${req.file.filename}`, () => {
                res.status(400).json({ error });
            });
        });
};

////////////////////////////////// Suppression d'un livre ///////////////////////////////
exports.deleteBook = (req, res, next) => {
    // Recherche du livre par son ID
    Book.findOne({_id: req.params.id})
    .then(book => {
        // Vérification des droits de l'utilisateur
        if (book.userId.toString() !== req.auth.userId) {
            return res.status(401).json({ message : 'Non-autorisé'});
        }

        // Extraction du nom du fichier image
        const filename = book.imageUrl.split('/images/')[1];
        
        // Suppression de l'image associée au livre
        fs.unlink(`images/${filename}`, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur suppression image' });
            }
            
            // Suppression du livre dans la base de données
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

/////////////////////////// Modification d'un livre /////////////////////////////////
exports.modifyBook = (req, res, next) => {
    // Recherche du livre par son ID
    Book.findOne({ _id: req.params.id })
    .then(book => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé !' });
        }
        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Non-autorisé' });
        }

        // Traitement en cas de nouvelle image
        //Vérification nouvelle image dans la requête si c'est le cas crée le livre avec la nouvelle image
        let bookObject;
        if (req.file) {
            bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            };
            //Suppression de l'ancienne image du serveur
            const fileToDelete = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileToDelete}`, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression de l'ancienne image :", err);
                    return res.status(500).json({ error: "Erreur lors de la suppression de l'ancienne image" });
                }
            //Mise à jour du livre 
                updateBook(bookObject, req, res);
            });
        } else {
            // Sinon garde les données de la requête initiale
            bookObject = { ...req.body };
            updateBook(bookObject, req, res);
        }
    })
    .catch(error => {
        res.status(400).json({ error });
    });
};

// Fonction pour mettre à jour un livre
function updateBook(bookObject, req, res) {
    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
    .catch(error => res.status(400).json({ error }));
}

////////////////////////////// Ajout d'une note à un livre/////////////////////////////////////
exports.addRating = (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.auth.userId;
    const grade = req.body.rating;

    // Validation de la note
    if (grade < 0 || grade > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }

    // Recherche du livre par ID
    Book.findOne({ _id: bookId })
    .then(book => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé !' });
        }
        // Vérification de si l'utilisateur à déjà noté le livre
        const userRating = book.ratings.find(rating => rating.userId === userId);
        if (userRating) {
            return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre." });
        }

        // Ajout de la nouvelle note
        book.ratings.push({ userId, grade });

        // Mise à jour de la moyenne des notes
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

///////////////////////// Récupération des trois meilleurs livres en fonction des notes////////////////////
exports.getBestBooks = (req, res, next) => {
    Book.find()
    // Tri par note décroissante
    .sort({ averageRating: -1 }) 
    // Limite à 3 résultats
    .limit(3) 
    .then(books => {
        res.status(200).json(books);
    })
    .catch(error => {
        res.status(400).json({ error });
    });
};