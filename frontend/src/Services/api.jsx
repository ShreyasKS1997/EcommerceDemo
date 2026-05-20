import {createApi} from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';

export const api = createApi({
    reducerPath: 'user',
    baseQuery: baseQuery,
    tagTypes: ['refreshTestUsers', 'refreshUser', 'refreshProducts', 'Cart', 'allOrdersAdmin', 'AllReviews'],
    endpoints: (builder) => ({
        getStripeApiKey: builder.query({
            query: () => '/stripeapikey',
        }),
    }),
});

export const {useGetStripeApiKeyQuery} = api;

