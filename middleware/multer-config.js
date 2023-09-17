const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Définition des types MIME autorisés pour les téléchargements d'images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration de l'emplacement de stockage (mémoire et non disque dur)
const storage = multer.memoryStorage();

// Filtre pour vérifier si le type MIME de l'image est autorisé
const fileFilter = (req, file, cb) => {
  const isValid = MIME_TYPES[file.mimetype];
  if (isValid) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Configuration de multer pour gérer les téléchargements d'images
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
}).single('image');

// Middleware pour gérer le téléchargement et le traitement des images
module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image' });
    }

    // Si pas de fichier dans la requête passage au middleware suivant
    if (!req.file) {
      return next();
    }

    // Création du nom du fichier
    const filename = req.file.originalname.split(' ').join('_') + Date.now() + '.webp';
    // Création du chemin ou le fichier sera sauvegardé
    const filepath = path.join('images', filename);

    // Utilisation de sharp pour traiter l'image (redimensionnement et conversion en .webp)
    sharp(req.file.buffer)
      .resize(800)                 
      .webp({ quality: 80 })
      .toFile(filepath, (err, info) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        }

        // Nom du fichier traité affecté à la requête pour utilisation ultérieur
        req.file.filename = filename;
        next();
      });
  });
};