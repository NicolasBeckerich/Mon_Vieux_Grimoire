const express = require('express');
const mongoose = require('mongoose');
const app = express();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Connexion à MongoDB
mongoose.connect('mongodb+srv://nicolas:projet7oc@cluster0.r1qtcyc.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;