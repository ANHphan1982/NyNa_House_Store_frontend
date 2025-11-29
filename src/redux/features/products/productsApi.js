// frontend/src/redux/features/products/productsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 🔥 FIX: Import API_URL từ utils
const getApiUrl = () => {
  // Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback
  if (import.meta.env.PROD) {
    return 'https://nyna-house-store-backend-3.onrender.com';
  }
  
  // Development
  return 'http://localhost:5000';
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${getApiUrl()}/api/products`, // 🔥 FIX: Dùng dynamic URL
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  }
});

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery,
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    // Fetch all products
    fetchAllProducts: builder.query({
      query: ({ category, search, sort, order, page = 1, limit = 100, includeInactive = false } = {}) => {
        let url = '/?';
        if (category) url += `category=${category}&`;
        if (search) url += `search=${search}&`;
        if (sort) url += `sort=${sort}&`;
        if (order) url += `order=${order}&`;
        if (includeInactive) url += `includeInactive=true&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Products']
    }),

    // Fetch product by ID
    fetchProductById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Products', id }]
    }),

    // Fetch related products
    fetchRelatedProducts: builder.query({
      query: (id) => `/${id}/related`,
      providesTags: ['Products']
    }),

    // Add product (Admin only)
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: '/',
        method: 'POST',
        body: newProduct
      }),
      invalidatesTags: ['Products'],
      // 🔥 FIX: Clear cache sau khi thêm
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem('products');
          window.dispatchEvent(new Event('productsUpdated'));
        } catch (error) {
          console.error('Add product failed:', error);
        }
      }
    }),

    // Update product (Admin only)
    updateProduct: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: rest
      }),
      invalidatesTags: ['Products'],
      // 🔥 FIX: Clear cache sau khi update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem('products');
          window.dispatchEvent(new Event('productsUpdated'));
        } catch (error) {
          console.error('Update product failed:', error);
        }
      }
    }),

    // Delete product (Admin only)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Products'],
      // 🔥 FIX: Clear cache sau khi xóa
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem('products');
          window.dispatchEvent(new Event('productsUpdated'));
        } catch (error) {
          console.error('Delete product failed:', error);
        }
      }
    })
  })
});

export const {
  useFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useFetchRelatedProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productsApi;

export default productsApi;