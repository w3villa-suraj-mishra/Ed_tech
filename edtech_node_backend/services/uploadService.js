const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('DELETE LOCAL FILE FAILED:', error.message);
  }
};

const handleFileUpload = async (file, isVideo = false) => {
  if (!file || !file.path) {
    return null;
  }

  const filename = path.basename(file.path);
  const localUrl = `/uploads/${filename}`;

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadOptions = {
        resource_type: isVideo ? 'video' : 'image',
        folder: isVideo ? 'edtech/videos' : 'edtech/images',
        timeout: 15000
      };

      const result = await Promise.race([
        cloudinary.uploader.upload(file.path, uploadOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cloudinary upload timed out')), 15000))
      ]);

      deleteLocalFile(file.path);
      return result.secure_url;
    }
  } catch (error) {
    logger.warn('Cloudinary upload skipped or timed out, serving file locally:', error.message);
  }

  // Fallback to serving the locally stored file directly from /uploads
  return localUrl;
};

module.exports = {
  deleteLocalFile,
  handleFileUpload
};
