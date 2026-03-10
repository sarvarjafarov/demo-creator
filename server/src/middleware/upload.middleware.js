import multer from 'multer';

/** Store files in memory for S3 upload */
const storage = multer.memoryStorage();

/** File filter: allow images, audio, and video */
function fileFilter(req, file, cb) {
  const allowedMimes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
}

/** Voice upload: single file, max 10MB */
export const uploadVoice = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('voice');

/** Asset upload: multiple files, max 20MB each */
export const uploadAssets = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array('assets', 10);
