const cloudinary = require('cloudinary').v2;

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
  try {
    const file = req.files.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'getTrendy',
      resource_type: 'auto',
    });

    // Delete the temporary file
    fs.unlinkSync(file.tempFilePath);

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
