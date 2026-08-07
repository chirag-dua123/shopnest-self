const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFromBuffer } = require('../utils/cloudinaryUpload');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
// Add basic validation for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, (req, res, next) => {
    // Wrap multer in a promise-like way to catch its errors cleanly
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await uploadFromBuffer(req.file.buffer);
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
});

module.exports = router;
