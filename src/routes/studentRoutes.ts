import { Router } from 'express';
import multer from 'multer';
import { StudentController } from '../controllers/studentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post(
  '/',
  upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'resultSlip', maxCount: 1 },
    { name: 'previousReport', maxCount: 1 },
    { name: 'mitationLetter', maxCount: 1 },
  ]),
  StudentController.createStudent // No auth middleware here
);

// Protected routes
router.get('/:id', authMiddleware, StudentController.getStudentById);
router.get('/', authMiddleware, StudentController.getAllStudents);
router.patch('/:id/status', authMiddleware, StudentController.updateStudentStatus);
router.post('/:id/babyeyi-document', authMiddleware, upload.single('babyeyiDocument'), StudentController.issueBabyeyiDocument);

export default router;