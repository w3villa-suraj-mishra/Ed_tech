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
      const folder = isVideo ? 'edtech/videos' : 'edtech/images';
      const result = isVideo
        ? await cloudinary.uploader.upload_large(file.path, {
            resource_type: 'video',
            folder,
            chunk_size: 20 * 1024 * 1024
          })
        : await cloudinary.uploader.upload(file.path, { resource_type: 'auto', folder });

      deleteLocalFile(file.path);
      return result.secure_url;
    }
  } catch (error) {
    logger.error('CLOUDINARY UPLOAD FAILED, FALLING BACK TO LOCAL:', error.message || JSON.stringify(error));
  }

  // Fallback: serve the locally stored file from /uploads
  return localUrl;
};

module.exports = {
  deleteLocalFile,
  handleFileUpload
};
