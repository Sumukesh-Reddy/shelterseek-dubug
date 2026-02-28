const mongoose = require('mongoose');
const fs = require('fs');

// Upload file to GridFS
const uploadToGridFS = async (file, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  const fileStream = fs.createReadStream(file.path);
  const uploadStream = global.gfsBucket.openUploadStream(file.originalname, {
    contentType: file.mimetype
  });

  return new Promise((resolve, reject) => {
    fileStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        // Clean up temp file
        fs.unlinkSync(file.path);
        resolve(uploadStream.id.toString());
      });
  });
};

// Upload multiple files
const uploadMultipleToGridFS = async (files, bucketName = 'images') => {
  const ids = [];
  
  for (const file of files) {
    try {
      const id = await uploadToGridFS(file, bucketName);
      ids.push(id);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  
  return ids;
};

// Delete file from GridFS
const deleteFromGridFS = async (fileId, bucketName = 'images') => {
  if (!global.gfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }

  try {
    await global.gfsBucket.delete(new mongoose.Types.ObjectId(fileId));
    return true;
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