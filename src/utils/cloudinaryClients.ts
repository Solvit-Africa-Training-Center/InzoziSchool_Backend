import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Declare and validate environment variables first
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('❌ Missing Cloudinary environment variables');
}

// Type assertion to satisfy strict TypeScript typing
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME as string,
  api_key: CLOUDINARY_API_KEY as string,
  api_secret: CLOUDINARY_API_SECRET as string,
});

export { cloudinary };
