import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../utils/cloudinaryClients';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req: any, file: { originalname: string; }) => ({
    folder: 'students',
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    resource_type: 'auto', // ✅ handles images and PDFs
  }),
});

export const studentUpload = multer({ storage }).fields([
  { name: 'resultSlip', maxCount: 1 },
  { name: 'previousReport', maxCount: 1 },
  { name: 'mitationLetter', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
]);
