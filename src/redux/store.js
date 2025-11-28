// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import productsApi from './features/products/productsApi';
import ordersApi from './features/orders/ordersApi';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productsApi.middleware, 
      ordersApi.middleware
    ),
});

export default store;