const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Upload file to GridFS
const uploadToGridFS = async (file, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  try {
    const fileStream = fs.createReadStream(file.path);
    const uploadStream = global.gfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype
    });

    return new Promise((resolve, reject) => {
      let finished = false;
      fileStream.pipe(uploadStream)
        .on('error', (err) => {
          console.error('❌ Upload stream error:', err && err.message ? err.message : err);
          // If BSON version mismatch, fallback to local storage
          const msg = err && err.message ? err.message : '';
          if (msg.includes('Unsupported BSON version') || (err && err.name === 'BSONVersionError')) {
            // Keep the file on disk (multer already saved it to uploads dir)
            const fallbackName = path.basename(file.path);
            console.warn(`⚠️ Falling back to local storage for ${file.originalname} -> ${fallbackName}`);
            finished = true;
            return resolve(fallbackName);
          }
          return reject(err);
        })
        .on('finish', () => {
          finished = true;
          // Clean up temp file (since we've stored in GridFS)
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.warn('⚠️ Could not delete temp file:', err.message);
          }
          // Return ObjectId as string to ensure compatibility
          const idString = uploadStream.id.toString();
          console.log(`✅ File uploaded: ${file.originalname} (ID: ${idString})`);
          resolve(idString);
        });
    });
  } catch (err) {
    console.error('❌ GridFS upload error:', err && err.message ? err.message : err);
    // On unexpected errors, if file exists on disk (multer saved), fallback to returning filename
    try {
      if (fs.existsSync(file.path)) {
        const fallbackName = path.basename(file.path);
        console.warn(`⚠️ Falling back to local storage for ${file.originalname} -> ${fallbackName}`);
        return fallbackName;
      }
    } catch (e) {
      // ignore
    }
    throw err;
  }
};

// Upload multiple files
const uploadMultipleToGridFS = async (files, bucketName = 'images') => {
  if (!files || files.length === 0) {
    return [];
  }

  const ids = [];
  const errors = [];
  
  for (const file of files) {
    try {
      const id = await uploadToGridFS(file, bucketName);
      ids.push(id);
      console.log(`✅ Uploaded file to GridFS: ${file.originalname} -> ${id}`);
    } catch (error) {
      console.error(`❌ Error uploading file ${file.originalname}:`, error);
      errors.push({ file: file.originalname, error: error.message });
    }
  }
  
  // If some files failed to upload, log warning but continue with successful ones
  if (errors.length > 0) {
    console.warn(`⚠️ Failed to upload ${errors.length} file(s):`, errors);
  }
  
  return ids;
};

// Delete file from GridFS
const deleteFromGridFS = async (fileId, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  try {
    // If fileId looks like an ObjectId, attempt GridFS delete
    if (mongoose.Types.ObjectId.isValid(fileId)) {
      await global.gfsBucket.delete(new mongoose.Types.ObjectId(fileId));
      return true;
    }

    // Otherwise treat as local filename in public/uploads
    const path = require('path');
    const fs = require('fs');
    const localPath = path.join(__dirname, '../../public/uploads', fileId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file stream
const getFileStream = (fileId, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  return global.gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

// Get file metadata
const getFileMetadata = async (fileId, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  const files = await global.gfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
  return files[0] || null;
};

module.exports = {
  uploadToGridFS,
  uploadMultipleToGridFS,
  deleteFromGridFS,
  getFileStream,
  getFileMetadata
};