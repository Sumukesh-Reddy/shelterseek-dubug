const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Get image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!global.gfsBucket) {
      console.error('GridFS bucket not initialized');
      return res.status(500).json({ success: false, message: 'Image service not available' });
    }

    // Try GridFS first if id looks like ObjectId
    let attemptedGridFS = false;
    if (mongoose.Types.ObjectId.isValid(id) && global.gfsBucket) {
      attemptedGridFS = true;
      const objectId = new mongoose.Types.ObjectId(id);
      const files = await global.gfsBucket.find({ _id: objectId }).toArray();
      if (files && files.length > 0) {
        const file = files[0];
        const contentType = file.contentType || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        const range = req.headers.range;
        if (range && contentType.startsWith('video/')) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
          const chunkSize = (end - start) + 1;

          res.status(206);
          res.set({
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${file.length}`,
            'Content-Length': chunkSize
          });

          const downloadStream = global.gfsBucket.openDownloadStream(objectId, { start, end });
          downloadStream.on('error', (error) => {
            console.error('Error streaming file (range):', error);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Error streaming file' });
          });
          return downloadStream.pipe(res);
        }

        const downloadStream = global.gfsBucket.openDownloadStream(objectId);
        downloadStream.on('error', (error) => {
          console.error('Error streaming image:', error);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error streaming image' });
          }
        });
        return downloadStream.pipe(res);
      }
    }

    // If not found (or not attempted), check local uploads folder
    const path = require('path');
    const fs = require('fs');
    const localPath = path.join(__dirname, '../../public/uploads', id);
    if (fs.existsSync(localPath)) {
      const stat = fs.statSync(localPath);
      const contentType = require('mime-types').lookup(localPath) || 'application/octet-stream';
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=31536000');

      const range = req.headers.range;
      if (range && contentType.startsWith('video/')) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunkSize = (end - start) + 1;

        res.status(206);
        res.set({
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': chunkSize
        });

        const stream = fs.createReadStream(localPath, { start, end });
        return stream.pipe(res);
      }

      return fs.createReadStream(localPath).pipe(res);
    }

    if (attemptedGridFS) {
      console.log(`Image not found in GridFS or local: ${id}`);
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    return res.status(400).json({ success: false, message: 'Invalid image ID or file not found' });
    
  } catch (error) {
    console.error('Error fetching image:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to fetch image' });
    }
  }
});

module.exports = router;