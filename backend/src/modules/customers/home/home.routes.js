import express from 'express';
const router = express.Router();
import { getHomeData, getSubCategories, getProducts, getProductById } from './home.controller.js';
import optionalCustomerAuth from '../../../middlewares/optionalCustomerAuth.middleware.js';

// Route to get home page data for customers
router.get("/home", optionalCustomerAuth, getHomeData);
router.get("/products", optionalCustomerAuth, getProducts);
router.get("/products/:id", optionalCustomerAuth, getProductById);
router.get("/subcategories/:categoryId", getSubCategories);


export default router;
