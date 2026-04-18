import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import * as cartService from "./cart.service.js";

export const getCart = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || null;
  const cartData = await cartService.getCartItems(customerId);
  const message = customerId ? "Cart fetched successfully" : "Please login to see your added products";
  return ApiResponse.success(res, message, cartData);
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  
  if (!customerId) {
    return ApiResponse.error(res, "Please login first to add items to cart", 401);
  }

  const { product_id, quantity } = req.body;

  const result = await cartService.addToCart(customerId, {
    product_id,
    quantity: parseInt(quantity) || 1,
  });

  const message = result.status === 'updated' 
      ? "Cart updated successfully" 
      : "Item added to cart successfully";

  return ApiResponse.success(res, message, result);
});


export const removeItemFromCart = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;

  if (!customerId) {
    return ApiResponse.error(res, "Please login first to remove items from cart", 401);
  }

  const { cart_id, cart_ids, product_id, quantity, clear_all } = req.body;

  const result = await cartService.removeFromCart(customerId, {
    cart_id,
    cart_ids,
    product_id,
    quantity,
    clear_all: clear_all === true || clear_all === "true"
  });

  return ApiResponse.success(res, result.message, result);
});


/**
 * Clear all products from the authenticated customer's cart
 */
export const clearCart = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  
  if (!customerId) {
    return ApiResponse.error(res, "Please login first to clear your cart", 401);
  }

  const result = await cartService.clearCart(customerId);
  return ApiResponse.success(res, result.message, result);
});


export default {
    getCart,
    addItemToCart,
    removeItemFromCart,
    clearCart
};