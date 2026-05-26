import { Router } from 'express';
import multer from 'multer';
import {
  createPrompt,
  getPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  updatePromptImage
} from '../controllers/prompt.controller';

const router = Router();

// Configuración de multer para almacenamiento en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Routes
router.post('/', upload.single('image'), createPrompt);
router.get('/', getPrompts);
router.get('/:id', getPromptById);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);
router.post('/:id/favorite', toggleFavorite);
router.post('/:id/image', upload.single('image'), updatePromptImage);

export default router;
