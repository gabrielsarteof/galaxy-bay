import { memoryStorage } from 'multer';

/**
 * memoryStorage mantém arquivo em buffer (file.buffer disponível).
 * diskStorage salvaria direto no disco (file.buffer undefined).
 */
export const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Formato inválido. Use JPEG, PNG, WebP ou SVG'), false);
    }
  },
};
