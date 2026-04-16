const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary will automatically use the CLOUDINARY_URL environment variable if set.
// Otherwise, it falls back to CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'shelterseek',
      resource_type: 'auto',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mpeg', 'mpg', 'ogg']
    };
  }
});

// Create multer instance - allow larger uploads (up to 50MB per file)
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 50MB.';
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