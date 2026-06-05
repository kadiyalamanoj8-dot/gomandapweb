const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../client/public/images'),
  path.join(__dirname, '../vendor/public/images')
];

async function compressAll() {
  let totalSaved = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    console.log(`Processing ${files.length} images in ${dir}...`);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const webpPath = filePath.replace('.png', '.webp');
      
      const originalSize = fs.statSync(filePath).size;
      
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(webpPath);
        
      const newSize = fs.statSync(webpPath).size;
      totalSaved += (originalSize - newSize);
      
      // Delete original PNG
      fs.unlinkSync(filePath);
      
      console.log(`Compressed ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024).toFixed(2)}KB`);
    }
  }
  
  console.log(`\nFinished! Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

compressAll().catch(console.error);
