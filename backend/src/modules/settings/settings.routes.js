import express from 'express';
import { getPages, updatePage, createPage, deletePage } from './settings.controller.js';
import validate from '../../middlewares/validate.js';
import authenticate from '../../middlewares/auth.middleware.js';
import { createPageSchema, updatePageSchema } from './settings.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/content', getPages);
router.post('/content', validate(createPageSchema), createPage);
router.put('/content/:key', validate(updatePageSchema), updatePage);
router.delete('/content/:key', deletePage);

export default router;
