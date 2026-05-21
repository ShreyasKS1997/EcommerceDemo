import { api } from "./api";
import { loadTestUsersAccount, storeAccount } from '../SliceThunks/userSliceThunks';

const userApi = api.injectEndpoints({
       endpoints: (builder) => ({
        deleteAllData: builder.mutation({
            query: () => ({
                url: '/delete/all',
                method: 'DELETE',
            }),
        }),
        resetPassword: builder.mutation({
            query: ({token, password}) => ({
                url: `/password/reset/${token}`,
                method: 'PUT',
                body: {password: password},
            }),
        }),
        forgotPassword: builder.mutation({
            query: (email) => ({
                url: '/password/forgot',
                method: 'POST',
                body: email,
            })
        }),
        updatePassword: builder.mutation({
            query: (body) => ({
                url: '/password/update',
                method: 'PUT',
                body: body,
                FormData: true,
            }),
        }),
        testUserDetailsByID: builder.query({
            query: (id) => `/get_test_user/${id}`,
            transformResponse: (responseData, meta, arg) => {
                return responseData.user;
            }
        }),
        updateTestUserProfile: builder.mutation({
            query: ({id, body}) => ({
                url: `/admin/user/${id}`,
                method: 'PUT',
                body: body,
                FormData: true,
            })
        }),
        updateProfile: builder.mutation({
            query: (body) => ({
                url: '/me/update',
                method: 'PUT',
                body: body,
                FormData: true,
            }),
            invalidatesTags: ['refreshTestUsers']
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST'
            }),
        }),
        generateTestUser: builder.mutation({
            query: (quantity) => ({
                url: '/generate_test_users',
                method: 'POST',
                body: {quantity: quantity},
            }),
            invalidatesTags: ['refreshTestUsers']
        }),
        loadTestUsers: builder.query({
            query: () => '/testusers',
            async onQueryStarted(args, {dispatch, queryFulfilled}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(loadTestUsersAccount(result.data));
                } catch(error) {
                    console.log(error);
                }
            },
            transformResponse: (resData, meta, arg) => {
                return resData.testUsers;
            },
            providesTags: ['refreshTestUsers']
        }),
        deleteTestUser: builder.mutation({
            query: (id) => ({
                url:`/delete_test_user/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['refreshTestUsers']
        }),
        generateTestAdmin: builder.mutation({
            query: () => ({
                url: '/generate_test_admin',
                method: 'POST',
            }),
            invalidatesTags: ['refreshTestUsers']
        }),
        loadTestAdmin: builder.query({
            query: () => '/testadmin',
            transformResponse: (responsedata, meta, arg) => {
                return responsedata.user;
            },
        }),
        postLogin: builder.mutation({
            query: (loginInfo) => ({
                url: '/login',
                method: 'POST',
                body: loginInfo,
            }),
        }),
        postRegister: builder.mutation({
            query: (registrationInfo) => ({
                url: '/register',
                method: 'POST',
                body: registrationInfo,
            }),
        }),
        loadUser: builder.query({
            query: () => '/me',
            transformResponse: (responsedata, meta, arg) => {
                return responsedata.user;
            },
            providesTags: ['refreshUser'],
        }),
        initLoad: builder.query({
            query: () => '/auth/refresh',
            transformResponse: (responsedata, meta, arg) => {
                return responsedata.user;
            },
            async onQueryStarted(args, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(storeAccount(data));
                } catch (error) {
                    console.log(error);
                };
            },
        }),
    }),
    overrideExisting: false,

});

export const {useDeleteAllDataMutation, useResetPasswordMutation, useForgotPasswordMutation, useUpdatePasswordMutation, useUpdateTestUserProfileMutation, useTestUserDetailsByIDQuery, useUpdateProfileMutation, useLogoutMutation, useGenerateTestAdminMutation, useGenerateTestUserMutation, useLoadTestUsersQuery, useDeleteTestUserMutation, usePostLoginMutation, usePostRegisterMutation, useLoadUserQuery, useInitLoadQuery, useLazyLoadTestAdminQuery} = userApi;