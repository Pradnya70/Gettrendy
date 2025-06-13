const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controller/uploadController');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post('/image', upload.single('file'), uploadImage);
router.post('/delete', deleteImage);

module.exports = router;
