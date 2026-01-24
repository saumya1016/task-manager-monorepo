const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

// 1. Initialize the S3 Client with your credentials
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// 2. Configure Multer-S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // Makes the image URL accessible to everyone
    contentType: multerS3.AUTO_CONTENT_TYPE, // Ensures the browser sees it as an image
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique filename: user-id/timestamp-filename.ext
      const userId = req.user ? req.user._id : "anonymous";
      const fileName = `profile-pics/${userId}/${Date.now()}_${path.basename(file.originalname)}`;
      cb(null, fileName);
    },
  }),
  // Optional: Add file filters for security
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

module.exports = upload;