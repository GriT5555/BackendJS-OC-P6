/* const multer = require ("multer");

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype] || 'jpg';
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');  1st version (OC course)*/

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  // vérifie que le path vers les le dos des images existe concrètement
}

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp'
}; // formats acceptés


const storage = multer.memoryStorage(); // stockage du fichier pre modif pour l'upload en DB avec modif

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPG, PNG, WEBP allowed.'), false);
  }
  // +- un error handling sur le format des images uploadées
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// 3. Middleware Wrapper to Process Image with Sharp
const processImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalName = req.file.originalname.split(' ').join('_');
  const extension = MIME_TYPES[req.file.mimetype] || 'jpg';
  const fileName = `${originalName}_${Date.now()}.${extension}`;
  const filePath = path.join(imagesDir, fileName);

  sharp(req.file.buffer)
    .resize({
      width: 750, 
      height: 750, 
      fit: 'inside', // dimensions max + pas de réagrandissement si image plus petite
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 }) // réduit la qualité de l'upload pour fit dans les recommendations de la DB
    .toFile(filePath, (err, info) => {
      if (err) {
        console.error('Sharp error:', err);
        return res.status(500).json({ error: 'Image processing failed' });
      }
      req.file.filename = fileName;
      req.file.path = filePath;
      req.file.size = info.size; 
      // synchronyse les noms des fichiers pour etre utilisable par les imageUrl sinon multer sait rien en faire PUISQUE les urls dans imageUrl finit par /${req.file.filename}
      // permet en resumé de changer les "mains" qui délivrent le fichier mais en gardant les infos qui font qu'il est accepté multer->sharp
      next();
    });
};

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    processImage(req, res, next);
  });
}; // on exporte la chaine de middleware dans l'ordre qu'on veut, reception de l'upload -> modif jusqu'a le paste dans la DB
