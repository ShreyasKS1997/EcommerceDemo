import { createSlice, current } from "@reduxjs/toolkit";

const authSliceInitialState = {
    activeUserId: null,
    accounts: {},
    status: 'booting', // 'booting' | 'authenticated' | 'unauthenticated'
    error: null,
};

const syncAuthState = (state) => {
    const hasActive = Boolean(state.activeUserId && state.accounts[state.activeUserId]);
    state.status = hasActive ? 'authenticated' : 'unauthenticated';
};

const authSlice = createSlice({
    name: 'auth',
    initialState: authSliceInitialState,
    reducers: {
        resetAccounts: (state, action) => {
            const user = Object.values(state.accounts).find((item) => item.role === 'user');
            if (user) {
                state.activeUserId = user._id;
            } else {
                return {
                    ...authSliceInitialState,
                    status: 'unauthenticated'
                }
            }
        },
        loadTestUsersAccount: (state, action) => {
            for (const id in state.accounts) {
                if (state.accounts[id].role === 'test_user') {
                    delete state.accounts[id];
                };
            };
            action.payload.forEach(item => {
                state.accounts[item._id] = item;
            })
        },
        storeAccount: (state, action) => {
            !state.activeUserId && (state.activeUserId = action.payload._id);
            state.accounts[action.payload._id] = action.payload;
            syncAuthState(state);
        },
        updateTokenRole: (state, action) => {
            const {_id, token, role} = action.payload;
            if (state.accounts[_id]) {
                state.accounts[_id].token = token;
                state.accounts[_id].role = role;
            }

        },
        storeAndSetActiveAccount: (state, action) => {
            state.accounts[action.payload._id] = action.payload;
            state.activeUserId = action.payload._id;

            syncAuthState(state);
        },
        switchAccount: (state, action) => {
            if (state.accounts[action.payload])
                state.activeUserId = action.payload;
            syncAuthState(state);
        },
        logoutAll: () => ({
            ...authSliceInitialState,
            status: 'unauthenticated',
        }),
    },
    extraReducers: {
        
    }
});

export const {resetAccounts, loadTestUsersAccount, switchAccount, logoutAll, updateTokenRole, storeAndSetActiveAccount, storeAccount} = authSlice.actions;

export const authSliceReducer = authSlice.reducer;
