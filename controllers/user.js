const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');  
const User = require('../models/User');

///////////////////////////// Inscrire un nouvel utilisateur //////////////////////////////
exports.signup = (req, res, next) => {
    // Récupération de l'email et du mot de passe de la requête
    const { email, password } = req.body; 

    // Hashage du mot de passe avec 10 tours
    bcrypt.hash(password, 10)
        .then((hash) => {
            // Création d'un nouvel utilisateur avec l'email et le mot de passe hashé
            const user = new User({
                email: email,
                password: hash
            });
            
            // Sauvegarde de l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch((error) => {
                    // Vérification de si il existe déjà
                    if (error.name === 'ValidationError' && error.errors.email.kind === 'unique') {
                        return res.status(409).json({ error: 'Utilisateur déjà existant' });
                    }
                    res.status(400).json({ error });
                });
        })
        .catch((error) => res.status(500).json({ error }));
};

//////////////////////////////////  Connexion d'un utilisateur existant////////////////////////////////
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur par email
    User.findOne({ email: req.body.email })
        .then(user => {
            // Si l'utilisateur n'est pas trouvé
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            
            // Comparaison entre mot de passe envoyé et celui de la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si différent renvoie l'erreur 
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    
                    // Si tout est bon renvoie du userId et du token pour la session (24h pour token)
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.SECRET_TOKEN,  
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); 
        })
        .catch(error => res.status(500).json({ error }));
};
