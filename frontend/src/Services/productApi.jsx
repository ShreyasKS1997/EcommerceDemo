import { api } from "./api"

const productApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSearchProductResult: builder.query({
            query: ({keyword='', currentPage=1, price=[0, 2000000], category='', ratings=0}) => 
                `/products?keyword=${keyword}&page=${currentPage}&` +
                    `price[gte]=${price[0]}&price[lte]=${price[1]}&` +
                        `category=${category}&ratings[gte]=${ratings}`,
        }),
        deleteReview: builder.mutation({
            query: ({id, productId}) => ({
                url: `/review?id=${id}&productId=${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AllReviews']
        }),
        getAllReviewAdmin: builder.query({
            query: (id) => `/review?id=${id}`,
            providesTags: ['AllReviews']
        }),
        submitReview: builder.mutation({
            query: (data) => ({
                url: '/review',
                method: 'PUT',
                body: data,
                FormData: true,
            }),
        }),
        getProductDetails: builder.query({
            query: (id) => `/product/${id}`,
            transformResponse: (resData, meta, arg) => {
                return resData.product;
            }
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/admin/product/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['refreshProducts'],
        }),
        updateProduct: builder.mutation({
            query: ({id, productData}) => ({
                url: `/admin/product/${id}`,
                method: 'PUT',
                body: productData,
                FormData: true,
            }),
            invalidatesTags: ['refreshProducts'],
        }),
        getAllProducts: builder.query({
            query: (queries) => ({
                url: '/products',
                params: {...queries},
            }),
            providesTags: ['refreshProducts'],
        }),
        createNewProduct: builder.mutation({
            query: (data) => ({
                url: '/admin/product/new',
                method: 'POST',
                body: data,
                FormData: true,
            }),
            invalidatesTags: ['refreshProducts'],
        }),
    }),
    overrideExisting: false,
});

export const {useGetSearchProductResultQuery, useDeleteReviewMutation, useGetAllReviewAdminQuery, useSubmitReviewMutation, useGetProductDetailsQuery, useDeleteProductMutation, useUpdateProductMutation, useGetAllProductsQuery, useCreateNewProductMutation} = productApi;