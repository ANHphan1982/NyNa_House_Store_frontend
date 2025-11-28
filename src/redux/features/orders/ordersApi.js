// src/redux/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  return import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000'
    : 'https://your-production-url.com';
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/orders`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    // Create new order
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: '/',
        method: 'POST',
        body: newOrder
      }),
      invalidatesTags: ['Orders']
    }),

    // Get user orders
    getUserOrders: builder.query({
      query: () => '/user',
      providesTags: ['Orders']
    }),

    // Get order by ID
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }]
    }),

    // Get all orders (Admin)
    getAllOrders: builder.query({
      query: ({ status, page = 1, limit = 20 } = {}) => {
        let url = '/?';
        if (status) url += `status=${status}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Orders']
    }),

    // Update order status (Admin)
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Orders']
    }),

    // Cancel order
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Orders']
    })
  })
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation
} = ordersApi;

export default ordersApi;













































