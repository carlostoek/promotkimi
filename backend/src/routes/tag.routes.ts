import { Router } from 'express';
import { getTags, getTagSuggestions } from '../controllers/tag.controller';

const router = Router();

// Routes
router.get('/', getTags);
router.get('/suggest', getTagSuggestions);

export default router;
