import { createSlice, nanoid } from "@reduxjs/toolkit";

const appSlice = createSlice({
    name: 'app',
    initialState: {
        Notifications: [],
        serverError: null,
    },
    reducers: {
        addNotification: (state, action) => {
            const notification = {
                id: nanoid(),
                message : action.payload.message,
                errorType: action.payload.errorType ?? 'alert',
            }
            state.Notifications.push(notification); 
        },
        removeNotification: (state, action) => {
            state.Notifications = state.Notifications.filter((item) => item.id !== action.payload);
        },
        setUnCaughtServerError: (state, action) => {
            state.serverError = action.payload;
        },
        removeUnCaughtServerError: (state, action) => {
            state.serverError = null;
        },
    }
});

export const {addNotification, removeNotification, setUnCaughtServerError, removeUnCaughtServerError} = appSlice.actions;
export const appSliceThunk = appSlice.reducer;

const searchResultSlice = createSlice({
    name: 'searchResult',
    initialState: {},
    reducers: {
        addSearchResults: (state, action) => {
            state = action.payload;
        },
    },
});

export const {addSearchResults} = searchResultSlice.actions;
export const searchResultThunk = searchResultSlice.reducer;

export const selectActiveAccount = (state) => {
    const id = state.auth.activeUserId;
    return id ? state.auth.accounts[id]: null
};