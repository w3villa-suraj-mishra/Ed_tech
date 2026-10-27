const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const ALLOWED_ASSIGNMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/x-pdf'
];

const isAllowedAssignmentFile = (file) => Boolean(file?.mimetype && ALLOWED_ASSIGNMENT_MIME_TYPES.includes(file.mimetype));

const getFileType = (mimetype) => (mimetype === 'application/pdf' || mimetype === 'application/x-pdf' ? 'pdf' : 'image');

const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('DELETE ASSIGNMENT LOCAL FILE FAILED:', error.message);
  }
};

const uploadAssignmentFile = async (file, useCloudinary = true) => {
  if (!file || !file.path) return null;

  const metadata = {
    fileName: file.originalname,
    fileType: getFileType(file.mimetype),
    mimeType: file.mimetype,
    size: file.size
  };

  if (!isAllowedAssignmentFile(file)) {
    deleteLocalFile(file.path);
    throw new Error('Only image and PDF files are allowed');
  }

  const hasCloudinaryConfig = Boolean(
    useCloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (hasCloudinaryConfig) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: metadata.fileType === 'pdf' ? 'raw' : 'image',
        folder: 'edtech/assignments'
      });
      deleteLocalFile(file.path);
      return {
        ...metadata,
        fileUrl: result.secure_url
      };
    } catch (error) {
      logger.warn(`ASSIGNMENT CLOUDINARY UPLOAD FAILED, USING LOCAL FILE: ${error.message}`);
    }
  }

  return {
    ...metadata,
    fileUrl: `/uploads/${path.basename(file.path)}`
  };
};

const uploadAssignmentFiles = async (files = []) => {
  const uploaded = [];
  for (const file of files) {
    const result = await uploadAssignmentFile(file);
    if (result) uploaded.push(result);
  }
  return uploaded;
};

const cleanupUploadedFiles = (files = []) => {
  files.forEach((file) => deleteLocalFile(file?.path));
};

const getAccessibleFileUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return fileUrl;
  if (fileUrl.includes('api.cloudinary.com')) return fileUrl;

  const rawMatch = fileUrl.match(/\/raw\/upload\/(?:(?:s--[^/]+--\/)?(?:v\d+\/)?)(.+)$/i);
  if (rawMatch && process.env.CLOUDINARY_API_SECRET) {
    const rawPublicId = rawMatch[1];
    const cleanPublicId = decodeURIComponent(rawPublicId.split('?')[0].split('#')[0]);
    const extMatch = cleanPublicId.match(/\.([a-z0-9]+)$/i);
    const format = extMatch ? extMatch[1] : 'pdf';

    const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days validity
    try {
      return cloudinary.utils.private_download_url(cleanPublicId, format, {
        resource_type: 'raw',
        type: 'upload',
        expires_at: expiresAt
      });
    } catch (err) {
      logger.error('Error generating Cloudinary accessible download URL:', err.message);
    }
  }
  return fileUrl;
};

const formatFileRecord = (file) => {
  if (!file) return file;
  const json = typeof file.toJSON === 'function' ? file.toJSON() : { ...file };
  return {
    ...json,
    fileUrl: getAccessibleFileUrl(json.fileUrl)
  };
};

const formatSubmissionRecord = (submission) => {
  if (!submission) return submission;
  const json = typeof submission.toJSON === 'function' ? submission.toJSON() : { ...submission };
  return {
    ...json,
    files: (json.files || []).map(formatFileRecord)
  };
};

const formatAssignmentRecord = (assignment) => {
  if (!assignment) return assignment;
  const json = typeof assignment.toJSON === 'function' ? assignment.toJSON() : { ...assignment };
  return {
    ...json,
    resources: (json.resources || []).map(formatFileRecord),
    submissions: json.submissions ? json.submissions.map(formatSubmissionRecord) : undefined,
    mySubmission: json.mySubmission ? formatSubmissionRecord(json.mySubmission) : undefined
  };
};

module.exports = {
  ALLOWED_ASSIGNMENT_MIME_TYPES,
  isAllowedAssignmentFile,
  getFileType,
  uploadAssignmentFile,
  uploadAssignmentFiles,
  cleanupUploadedFiles,
  deleteLocalFile,
  getAccessibleFileUrl,
  formatFileRecord,
  formatSubmissionRecord,
  formatAssignmentRecord
};

