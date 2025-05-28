import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderName = file.fieldname;
        const uploadPath = path.join('public', folderName);

        fs.mkdir(uploadPath, { recursive: true }, (error) => {
            if (error) return cb(error);
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        const sanitizedName = file.originalname.replace(/\s+/g, '');
        const finalName = `${Date.now()}-${sanitizedName}`;
        cb(null, finalName);
    }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpeg', '.jpg', '.png', '.webp', '.jfif'];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jfif', 
    'application/octet-stream' // fallback for .jfif when mimetype is incorrect
  ];

  if (!allowedExts.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP, and JFIF formats are allowed.'));
  }

  cb(null, true);
};


const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export const convertJfifToJpeg = async (req, res, next) => {
  try {
    if (!req.files || !req.files['productimage'] || req.files['productimage'].length === 0) {
      return next();
    }

    const file = req.files['productimage'][0];
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === '.jfif') {
      const parsedPath = path.parse(file.path);
      const jpegPath = path.join(parsedPath.dir, `${parsedPath.name}.jpeg`);

      await sharp(file.path)
        .jpeg()
        .toFile(jpegPath);

      fs.unlinkSync(file.path); // Delete .jfif
      file.path = jpegPath;
      file.filename = path.basename(jpegPath);
      file.mimetype = 'image/jpeg';
    }

    next();
  } catch (err) {
    next(err);
  }
};


export default upload;
