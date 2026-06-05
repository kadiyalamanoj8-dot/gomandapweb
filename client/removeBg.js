import { Jimp } from 'jimp';

async function run() {
  console.log("Loading image...");
  const image = await Jimp.read("public/images/couple_by_fire.png");
  
  console.log("Processing pixels...");
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Calculate luminance
    const lum = Math.max(r, g, b);
    
    // Smooth threshold: 
    // If lum is < 20, it's pitch black background -> 0 alpha.
    // If lum is > 50, it's the subject -> 255 alpha.
    // In between, we do a smooth gradient to prevent jagged edges!
    let a = 0;
    if (lum >= 40) {
      a = 255;
    } else if (lum > 15) {
      // Scale 15-40 to 0-255
      a = ((lum - 15) / 25) * 255;
    }
    
    this.bitmap.data[idx + 3] = a;
  });
  
  console.log("Writing transparent image...");
  await image.write("public/images/couple_transparent.png");
  console.log("Done!");
}

run().catch(console.error);
