import { api } from "./api";

const orderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        deleteOrderAdmin: builder.mutation({
            query: (id) => ({
                url: `/admin/order/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['allOrdersAdmin']
        }),
        updateOrderAdmin: builder.mutation({
            query: ({id, data}) => ({
                url: `/admin/order/${id}`,
                method: 'PUT',
                body: data,
                FormData: true,
            }),
        }),
        getAllOrdersAdmin: builder.query({
            query: () => '/admin/orders',
            providesTags: ['allOrdersAdmin'],
        }),
        getOrderDetails: builder.query({
            query: (id) => `/order/${id}`,
        }),
        processPayment: builder.mutation({
            query: (data) => ({
                url: '/payment/process',
                method: 'POST',
                body: data,
                FormData: true,
            }),
        }),
        createNewOrder: builder.mutation({
            query: (data) => ({
                url: '/order/new',
                method: 'POST',
                body: data,
                FormData: true,
            }),
        }),
        getOrder: builder.query({
            query: () => '/orders/me',
            providesTags: ['userOrders']
        }),
    }),
});

export const {useDeleteOrderAdminMutation, useUpdateOrderAdminMutation, useGetAllOrdersAdminQuery, useGetOrderDetailsQuery, useProcessPaymentMutation, useCreateNewOrderMutation, useGetOrderQuery} = orderApi;