const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on the route or fieldname
    let folderName = 'misc'; // Default folder
    
    if (file.fieldname === 'profile') {
      folderName = 'profiles';
    } else if (file.fieldname === 'recipe') {
      folderName = 'recipes';
    } else if (file.fieldname === 'ingredient') {
      folderName = 'ingredients';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;