require('dotenv').config();
const jwt = require('jsonwebtoken');

//  Middleware pour authentifier l'utilisateur
module.exports = (req, res, next) => {
    try {
        // Récupération du token depuis headears de la requête
        const token = req.headers.authorization.split(' ')[1];
        
        // Décodage du token avec clé stocké dans .env
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        
        // Récupération de l'identifiant à partir du token décodé
        const userId = decodedToken.userId;
        
        // Ajout du userId dans la req pour utilisation ultérieur
        req.auth = {
            userId: userId
        };
        
        // Passage au middleware ou à la route suivante
        next();
    } catch(error) {
        res.status(401).json({ error });
    }
 };