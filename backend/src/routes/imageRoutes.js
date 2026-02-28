// routes/imageRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Get image by ID or filename
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!global.gfsBucket) {
      console.error('GridFS bucket not initialized');
      return res.status(500).json({ success: false, message: 'Image service not available' });
    }

    // Check if it's a filename (contains extension)
    const isFilename = id.includes('.') || id.startsWith('images-');
    
    if (isFilename) {
      // Try local uploads folder first
      const localPath = path.join(__dirname, '../../public/uploads', id);
      if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        const contentType = require('mime-types').lookup(localPath) || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=31536000');
        
        return fs.createReadStream(localPath).pipe(res);
      }
      
      // Try GridFS with filename
      if (global.gfsBucket) {
        const files = await global.gfsBucket.find({ filename: id }).toArray();
        if (files && files.length > 0) {
          const file = files[0];
          res.set('Content-Type', file.contentType);
          res.set('Cache-Control', 'public, max-age=31536000');
          
          const downloadStream = global.gfsBucket.openDownloadStream(file._id);
          return downloadStream.pipe(res);
        }
      }
    }
    
    // Try as ObjectId (GridFS)
    if (mongoose.Types.ObjectId.isValid(id) && global.gfsBucket) {
      const objectId = new mongoose.Types.ObjectId(id);
      const files = await global.gfsBucket.find({ _id: objectId }).toArray();
      
      if (files && files.length > 0) {
        const file = files[0];
        res.set('Content-Type', file.contentType);
        res.set('Cache-Control', 'public, max-age=31536000');
        
        const downloadStream = global.gfsBucket.openDownloadStream(objectId);
        return downloadStream.pipe(res);
      }
    }
    
    // If not found, return 404
    console.log(`Image not found: ${id}`);
    return res.status(404).json({ success: false, message: 'Image not found' });
    
  } catch (error) {
    console.error('Error fetching image:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to fetch image' });
    }
  }
});

module.exports = router;