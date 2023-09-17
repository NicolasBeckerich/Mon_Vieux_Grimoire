const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Création d'un schéma Mongoose pour les utilisateurs
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Application du unique validator au schéma pour l'adresse e-mail de chaque utilisateur sera unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);    