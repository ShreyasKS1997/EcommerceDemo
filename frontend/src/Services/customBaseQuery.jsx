import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { logoutAll, resetAccounts, storeAccount, storeAndSetActiveAccount, switchAccount, updateTokenRole } from "../SliceThunks/userSliceThunks";
import { addNotification, removeUnCaughtServerError, setUnCaughtServerError } from "../SliceThunks/utils";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `/api/v1`,
    prepareHeaders: (headers, {getState}) => {
        const auth = getState().auth;
        const token = auth?.accounts && auth.accounts[auth.activeUserId]?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});



export const baseQuery = async (args, api, extraOptions ) => {

    let res = null;

    if (args === '/auth/refresh') {
        await navigator.locks.request('refreshLock', async () => {
            const lastSyncTime = parseInt(localStorage.getItem('lastRefreshTime') || '0');

            if (lastSyncTime && (Date.now() - lastSyncTime) < 30000) {
                return;
            }

            res = await rawBaseQuery(args, api, extraOptions);
            if (res.data) {
                const newDate = Date.now();
                localStorage.setItem('lastRefreshTime', newDate.toString());
            }
        });
        if (res === null) {
            const auth = api.getState().auth;
            return {
                data: {
                    user: {...auth.accounts[auth.activeUserId]}
                },
        };
    }
    } else {
        res = await rawBaseQuery(args, api, extraOptions);
    }
    
    if (res.error) {

        if ([401, 403].includes(res.error.status) && ['Refresh token grace period expired', "ACCESS_TOKEN_EXPIRED", "NO_TOKEN", "ANOTHER_USER_LOGGED_IN"].includes(res.error.data.error.message)) {
            const errorMessage = res.error.data.error.message;

            await navigator.locks.request('refreshLock', async () => {

                const lastRefreshTime = parseInt(localStorage.getItem('lastRefreshTime') || '0');

                if (lastRefreshTime && (Date.now() - lastRefreshTime) < 30000) {
                    res = await rawBaseQuery(args, api, extraOptions);
                    if (!res.error) return;
                }

                res = await rawBaseQuery('/auth/refresh', api, extraOptions);
                if (res.error) {
                    if (api.getState().auth.status === 'authenticated'  && 
                        (res.error.status !== 502 && 
                            res.error.status !== 500)) {
                        api.dispatch(logoutAll());
                    }
                } else {
                    const newDate = Date.now();
                    localStorage.setItem('lastRefreshTime', newDate.toString());
                    if (errorMessage === 'ANOTHER_USER_LOGGED_IN') {
                        await api.dispatch(storeAndSetActiveAccount(res.data.user));
                    } else {
                        await api.dispatch(storeAccount(res.data.user));
                    }
                    res = await rawBaseQuery(args, api, extraOptions);
                }
                
            });

        } else if(res.error.status === 401 && res.error.data.error.message === "NO_SESSION") {
            api.dispatch(logoutAll());
        } else if (res.error.data?.error.message === "USER_NOT_FOUND") {
            api.dispatch(resetAccounts());
            api.util.invalidateTags(['refreshUser']);
        } else if ([500, 501, 502].includes(res.error.status)) {
            await api.dispatch(setUnCaughtServerError(res.error));
        }

        if (res.error && res.error.data && !['NO_SESSION', 'NO_TOKEN', 'ACCESS_TOKEN_EXPIRED', 'SESSION_REVOKED', 'Grace session period exceeded'].includes(res.error.data?.error.message)) {
            Object.values(res.error.data?.error.messageObject).forEach((item, index) => {
                    setTimeout(() => {
                        console.log(item)
                        api.dispatch(addNotification({message:item, errorType: 'error'}))
                    }, 1000 * index);
                }
            );   
        }
    } else {
        api.getState().app.serverError && await api.dispatch(removeUnCaughtServerError(res.error));
    }

    if (res.data && res.data.message && res.data.success) {
        Object.values([res.data.message]).forEach((item, index) => {
                setTimeout(() => {
                    api.dispatch(addNotification({message:item, errorType: 'success'}))
                }, 1000 * index);
            }
        );
    }

    return res;
}