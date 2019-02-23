const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
// Multer is a node.js middleware for handling multipart/form-data , which is primarily used for uploading files.

cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.cloudKey,
  api_secret: process.env.cloudSecret
});

var storage = cloudinaryStorage({
 cloudinary: cloudinary,
 folder: 'sneaker-gallery', // The name of the folder in cloudinary
 allowedFormats: ['jpg', 'png'],
 // params: { resource_type: 'raw' }, => this is case you want to upload other types of files, not just images
 filename: function (res, file, cb) {
   cb(null, file.originalname); // The file on cloudinary would have the same name as the original file name
 }
});

const fileUploader = multer({ storage: storage });

module.exports = fileUploader;
