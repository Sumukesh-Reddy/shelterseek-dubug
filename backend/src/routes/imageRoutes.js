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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid image ID' });
    }

    const objectId = new mongoose.Types.ObjectId(id);
    
    // Check if file exists
    const files = await global.gfsBucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      console.log(`Image not found: ${id}`);
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const file = files[0];
    
    // Set appropriate content type
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Create download stream
    const downloadStream = global.gfsBucket.openDownloadStream(objectId);
    
    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming image' });
      }
    });

    // Pipe to response
    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('Error fetching image:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to fetch image' });
    }
  }
});

module.exports = router;