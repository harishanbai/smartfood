import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let isCloudinaryConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary service initialized successfully.');
} else {
  console.log('Cloudinary environment variables missing. Falling back to local image storage.');
}

/**
 * Uploads a local file to Cloudinary (if configured) or returns a local server path.
 * @param {string} localFilePath - Path to the locally stored file
 * @param {string} serverBaseUrl - The base URL of the backend server (e.g. http://localhost:5000)
 * @returns {Promise<string>} The image URL (Cloudinary URL or local server URL)
 */
export const uploadImage = async (localFilePath, serverBaseUrl = '') => {
  if (!localFilePath) return '';

  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'smart_lunch_generator'
      });
      // Delete local file after uploading to Cloudinary
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
      return result.secure_url;
    } else {
      // Return local server URL
      const relativePath = localFilePath.replace(/\\/g, '/'); // Normalize path separator
      // E.g. uploads/123456789.jpg -> /uploads/123456789.jpg
      const cleanPath = relativePath.startsWith('./') ? relativePath.substring(1) : '/' + relativePath;
      return `${serverBaseUrl}${cleanPath}`;
    }
  } catch (error) {
    console.error('Upload error details:', error);
    // Return local server path as fallback
    const relativePath = localFilePath.replace(/\\/g, '/');
    const cleanPath = relativePath.startsWith('./') ? relativePath.substring(1) : '/' + relativePath;
    return `${serverBaseUrl}${cleanPath}`;
  }
};
