import { updateCart } from "../SliceThunks/cartSliceThunks";
import { api } from "./api";

const cartApi = api.injectEndpoints({
    endpoints: (builder) => ({
        updateCart: builder.mutation({
            query: (cartItems) => ({
                url: '/cart/update',
                method: 'PUT',
                body: cartItems,
            }),
            invalidatesTags: ['Cart'],
        }),
        replaceQuantity: builder.mutation({
            query: (cartItems) => ({
                url: '/cart/replace',
                method: 'PUT',
                body: cartItems,
            }),
            invalidatesTags: ['Cart'],
        }),
        removeCartItems: builder.mutation({
            query: (cartItems) => ({
                url: '/cart/remove',
                method: 'POST',
                body: cartItems,
            }),
            invalidatesTags: ['Cart'],
        }),
        getCartItems: builder.query({
            query: () => '/cart/get',
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                data && dispatch(updateCart(data.cartItems));
            },
            providesTags: ['Cart'],
        }),
        removeAllCartItems: builder.mutation({
            query: () => ({
                url: '/cart/removeall',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
    }),
});
export const {useUpdateCartMutation, useReplaceQuantityMutation, useRemoveCartItemsMutation, useGetCartItemsQuery, useRemoveAllCartItemsMutation} = cartApi;