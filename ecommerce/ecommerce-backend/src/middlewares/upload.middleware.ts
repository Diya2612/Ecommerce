import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils';
import { config } from '../utils/config/validate-env';

/**
 * @module UploadMiddleware
 * @description Safe file ingestion pipeline guarding against malicious uploads.
 * Employs strict MIME type checks alongside magic number (file signature) validation
 * to prevent file spoofing attacks where dangerous executables masquerade as images.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_FILE_TYPES = config.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim());

/**
 * Magic numbers (file signatures) for common file types
 * Used to validate actual file content, not just the MIME header
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  // Images
  // JPEG: Only check first 2 bytes (0xFF 0xD8) - third byte varies by format:
  // - 0xE0 for JFIF, 0xE1 for EXIF, 0xE2 for Canon, 0xE8 for SPIFF, etc.
  'image/jpeg': [[0xff, 0xd8]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
  'image/svg+xml': [
    [0x3c, 0x3f, 0x78, 0x6d, 0x6c],
    [0x3c, 0x73, 0x76, 0x67],
  ], // <?xml or <svg

  // Modern formats (HEIC/HEIF/AVIF) - all use ISO Base Media File Format
  // They start with ftyp box: [size(4 bytes)] [0x66,0x74,0x79,0x70 = "ftyp"] [brand(4 bytes)]
  // We check bytes 4-11 for "ftyp" + brand identifier
  'image/heic': [[0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]], // ftyp heic
  'image/heif': [[0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66]], // ftyp heif
  'image/avif': [[0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]], // ftyp avif

  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF

  // Archives
  'application/zip': [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],

  // Office documents (OOXML - same as ZIP)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4b, 0x03, 0x04]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
    [0x50, 0x4b, 0x03, 0x04],
  ],

  // CSV/Text files don't have magic numbers - validated by MIME only
};

/**
 * Validate file content against known magic numbers
 * Returns true if file content matches expected signature for its MIME type
 */
function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];

  // If no signature defined for this type, allow based on MIME check only
  // (e.g., CSV, plain text files)
  if (!signatures) {
    return true;
  }

  // Check if buffer starts with any of the valid signatures
  let isValid = signatures.some((signature) => {
    if (buffer.length < signature.length) {
      return false;
    }
    const matches = signature.every((byte, index) => buffer[index] === byte);
    return matches;
  });

  // Special handling for HEIC/HEIF/AVIF which may be misidentified as JPEG
  // These formats have "ftyp" signature at bytes 4-7
  if (!isValid && mimeType === 'image/jpeg') {
    // Check bytes 4-11 for ftyp + brand
    const ftypRegion = buffer.slice(4, 12);
    const isAVIF = ftypRegion.equals(Buffer.from([0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]));
    const isHEIC = ftypRegion.equals(Buffer.from([0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]));
    const isHEIF = ftypRegion.equals(Buffer.from([0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66]));

    if (isAVIF || isHEIC || isHEIF) {
      isValid = true;
    }
  }

  return isValid;
}

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * @description Centralized error handler transmuting Multer-specific limits into standardized HttpExceptions.
 */
const handleMulterError = (err: Error | multer.MulterError, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(
        new HttpException(
          400,
          `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        ),
      );
    } else {
      next(new HttpException(400, err.message));
    }
  } else {
    // An unknown error occurred
    next(new HttpException(400, err.message));
  }
};

/**
 * @description Single file ingestion guard. Protects the API by ensuring only correctly verified,
 * structurally sound files are passed downstream.
 */
export const uploadSingleFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const multerSingle = upload.single('file');

  multerSingle(req, res, (err: unknown) => {
    if (err) {
      handleMulterError(err as Error, next);
    } else {
      if (!req.file) {
        return next(new HttpException(400, 'No file uploaded'));
      }

      const isValidSignature = validateFileSignature(req.file.buffer, req.file.mimetype);
      if (!isValidSignature) {
        return next(
          new HttpException(
            400,
            `File content does not match declared type ${req.file.mimetype}. Possible file spoofing detected.`,
          ),
        );
      }

      next();
    }
  });
};


