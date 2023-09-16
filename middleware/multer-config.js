const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isValid = MIME_TYPES[file.mimetype];
  if (isValid) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image' });
    }

    if (!req.file) {
      return next();
    }

    const filename = req.file.originalname.split(' ').join('_') + Date.now() + '.webp';
    const filepath = path.join('images', filename);

    sharp(req.file.buffer)
      .resize(800) 
      .webp({ quality: 80 }) 
      .toFile(filepath, (err, info) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        }

        req.file.filename = filename;
        next();
      });
  });
};