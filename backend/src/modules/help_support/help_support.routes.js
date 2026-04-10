import express from 'express';
import { getContacts, updateContacts } from './help_support.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { updateContactsSchema } from './help_support.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getContacts);
router.put('/:role', validate(updateContactsSchema), updateContacts);

export default router;
