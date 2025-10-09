const multer = require("multer");

function getUploadMiddleware(type, maxSizeMB, maxFiles) {
  maxSizeMB = maxSizeMB || 100; // default 100 MB
  maxFiles = maxFiles || 15; // default 15 files

  // Use memory storage
  const storage = multer.memoryStorage();

  return multer({
    storage: storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
      files: maxFiles,
    },
  });
}

module.exports = getUploadMiddleware;

