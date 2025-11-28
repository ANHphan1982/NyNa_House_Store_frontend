// src/redux/features/products/productsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  return import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000'
    : 'https://your-production-url.com';
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/products`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
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
      query: ({ category, search, sort, order, page = 1, limit = 20 } = {}) => {
        let url = '/?';
        if (category) url += `category=${category}&`;
        if (search) url += `search=${search}&`;
        if (sort) url += `sort=${sort}&`;
        if (order) url += `order=${order}&`;
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
      invalidatesTags: ['Products']
    }),

    // Update product (Admin only)
    updateProduct: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: rest,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: ['Products']
    }),

    // Delete product (Admin only)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Products']
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