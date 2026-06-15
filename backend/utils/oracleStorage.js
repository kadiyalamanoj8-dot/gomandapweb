const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');

// Oracle Object Storage connection (S3 Compatible API)
const s3Client = new S3Client({
  region: process.env.ORACLE_REGION || 'ap-mumbai-1',
  endpoint: process.env.ORACLE_ENDPOINT, // e.g. https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
  credentials: {
    accessKeyId: process.env.ORACLE_ACCESS_KEY,
    secretAccessKey: process.env.ORACLE_SECRET_KEY,
  },
  // Essential for Oracle Object Storage compatibility
  forcePathStyle: true, 
});

/**
 * Compresses an image and uploads it to Oracle Cloud Object Storage.
 * @param {Buffer} fileBuffer - The original file buffer in memory
 * @param {String} originalName - The original file name
 * @param {String} folder - Optional folder prefix (e.g., 'portfolios')
 * @returns {String} The public URL of the uploaded image
 */
const uploadToOracleCloud = async (fileBuffer, originalName, folder = 'vendors') => {
  if (!process.env.ORACLE_BUCKET) {
    throw new Error("Oracle Cloud Bucket Name is not configured.");
  }

  try {
    // 1. Process and compress the image using Sharp
    // Convert everything to optimized WebP format
    const compressedBuffer = await sharp(fileBuffer)
      .webp({ quality: 80, effort: 6 }) // High compression with excellent quality
      .resize({ width: 1920, withoutEnlargement: true }) // Max 1080p equivalent width
      .toBuffer();

    // 2. Generate a unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = '.webp';
    const finalFilename = `${folder}/${Date.now()}-${uniqueSuffix}${ext}`;

    // 3. Upload to Oracle Object Storage
    const command = new PutObjectCommand({
      Bucket: process.env.ORACLE_BUCKET,
      Key: finalFilename,
      Body: compressedBuffer,
      ContentType: 'image/webp',
      // By default Oracle Object Storage buckets can be made public. 
      // Ensure the bucket has public read access configured in OCI console.
    });

    await s3Client.send(command);

    // 4. Return the public URL
    // Format for Oracle Object Storage native public URL:
    // https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket_name>/o/<key>
    // However, if we use the S3 endpoint style:
    const bucketUrl = `${process.env.ORACLE_ENDPOINT}/${process.env.ORACLE_BUCKET}`;
    return `${bucketUrl}/${finalFilename}`;

  } catch (error) {
    console.error("Oracle Cloud Upload Error:", error);
    throw new Error("Failed to process and upload image to Oracle Cloud.");
  }
};

module.exports = {
  s3Client,
  uploadToOracleCloud
};
