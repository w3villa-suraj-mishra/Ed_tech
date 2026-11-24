const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const MAX_SIMPLE_UPLOAD_BYTES = 90 * 1024 * 1024;

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
      const size = file.size || fs.statSync(file.path).size;

      const result = isVideo && size > MAX_SIMPLE_UPLOAD_BYTES
        ? await cloudinary.uploader.upload_large(file.path, {
            resource_type: 'video',
            folder,
            chunk_size: 20 * 1024 * 1024
          })
        : await cloudinary.uploader.upload(file.path, {
            resource_type: isVideo ? 'video' : 'auto',
            folder
          });

      const url = result && (result.secure_url || result.url);
      if (!url) {
        throw new Error(`Cloudinary returned no URL. Keys: ${Object.keys(result || {}).join(', ')}`);
      }

      deleteLocalFile(file.path);
      return url.replace(/^http:\/\//, 'https://');
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
