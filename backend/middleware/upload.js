const multer = require('multer');

// Store files in memory so they can be compressed and uploaded to Oracle Cloud
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum size limit before compression
  }
});

module.exports = upload;
