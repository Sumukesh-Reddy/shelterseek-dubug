const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

// Create uploads directory
const uploadsDir = path.join(__dirname, '../../public/uploads');
mkdirp.sync(uploadsDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter - allow common images and video types
const fileFilter = (req, file, cb) => {
  const allowedImageExt = /jpeg|jpg|png|gif|webp/;
  const allowedVideoExt = /mp4|mov|avi|mpeg|mpg|webm|ogg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  const isImage = allowedImageExt.test(ext) || file.mimetype.startsWith('image/');
  const isVideo = allowedVideoExt.test(ext) || file.mimetype.startsWith('video/');

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

// Create multer instance - allow larger uploads (up to 50MB per file)
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field.';
    }
    
    return res.status(400).json({ success: false, message });
  }
  
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  
  next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;