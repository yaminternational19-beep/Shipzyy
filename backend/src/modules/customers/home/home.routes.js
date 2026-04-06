import express from 'express';
const router = express.Router();
import { getHomeData, getSubCategories, getProducts } from './home.controller.js';

// Route to get home page data for customers
router.get("/home", getHomeData);
router.get("/subcategories/:categoryId", getSubCategories); 
router.get("/subcategories/products", getProducts);

export default router;
