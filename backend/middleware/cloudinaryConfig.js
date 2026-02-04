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
  let folderName = 'misc';
  const url = req.originalUrl.toLowerCase(); // Get the URL path

  // 1. Logic for Profiles
  if (file.fieldname === 'profile' || url.includes('users') || url.includes('profile')) {
    folderName = 'profiles';
  } 
  // 2. Logic for Recipes
  else if (url.includes('recipes')) {
    folderName = 'recipes';
  } 
  // 3. Logic for Inventory
  else if (url.includes('inventory') || url.includes('items')) {
    folderName = 'items';
  }

  return {
    folder: folderName,
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // The dash here is great! Keep it.
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  };
}
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;