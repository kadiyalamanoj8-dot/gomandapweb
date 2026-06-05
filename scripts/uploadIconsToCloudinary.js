require('dotenv').config({ path: '../backend/.env' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagesDir = path.join(__dirname, '../client/public/images');
const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));

async function uploadImages() {
  const urlMap = {};
  console.log(`Starting upload of ${files.length} images...`);
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    try {
      // Upload to Cloudinary with format=webp
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'gomandap_icons',
        public_id: file.replace('.png', ''),
        format: 'webp',
        quality: 'auto',
        timeout: 120000 // 2 minutes
      });
      console.log(`Uploaded ${file} -> ${result.secure_url}`);
      urlMap[file] = result.secure_url;
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error);
    }
  }
  
  fs.writeFileSync(path.join(__dirname, 'icon_map.json'), JSON.stringify(urlMap, null, 2));
  console.log('Finished uploading. Mapping saved to icon_map.json');
}

uploadImages();
