const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const app = express();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Récupération dans .env pour la connexion à la base de données
require('dotenv').config();
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

// Tentative de connexion à MongoDB
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use(helmet()); 

// Configuration du ratelimit à 10 requêtes par minute pour Login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, 
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard"
});
app.use("/api/auth/login", loginLimiter);

// Configuration des headers pour la gestion des CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Configuration du chemin pour les images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configuration des routeurs
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;