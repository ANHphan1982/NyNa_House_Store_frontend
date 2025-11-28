// src/redux/features/cart/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
  cartItems: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, selectedSize } = action.payload;
      
      // Check if product with same id AND size already exists
      const existingItem = state.cartItems.find(
        item => item.id === id && item.selectedSize === selectedSize
      );

      if (!existingItem) {
        // Add new item with unique cartId
        state.cartItems.push({
          ...action.payload,
          cartId: Date.now(),
          quantity: 1
        });
        
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Đã thêm vào giỏ hàng",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        // Increase quantity if already exists
        existingItem.quantity += 1;
        
        Swal.fire({
          position: "top-end",
          icon: "info",
          title: "Đã tăng số lượng",
          showConfirmButton: false,
          timer: 1500
        });
      }
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        item => item.cartId !== action.payload
      );
      
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Đã xóa khỏi giỏ hàng",
        showConfirmButton: false,
        timer: 1500
      });
    },

    updateCartQuantity: (state, action) => {
      const { cartId, quantity } = action.payload;
      const item = state.cartItems.find(item => item.cartId === cartId);
      
      if (item) {
        item.quantity = quantity;
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
    }
  }
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => 
  state.cart.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemsCount = (state) => 
  state.cart.cartItems.reduce((total, item) => total + item.quantity, 0);