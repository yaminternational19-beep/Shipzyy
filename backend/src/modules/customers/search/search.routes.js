import express from 'express';
const router = express.Router();
import { searchProducts } from './search.controller.js';
import optionalCustomerAuth from '../../../middlewares/optionalCustomerAuth.middleware.js';


router.get("/search", optionalCustomerAuth, searchProducts);

export default router;
