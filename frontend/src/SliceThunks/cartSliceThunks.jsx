import { createSlice, current } from "@reduxjs/toolkit";
import { logoutAll } from "./userSliceThunks";

const cartSlice = createSlice({
    name: 'cart',
    initialState: {},
    reducers: {
        addToCart: (state, action) => {
            if (!state.cartItems) {
                state.cartItems = {}
            };
            Object.assign(state.cartItems, action.payload);
        },
        removeFromCart: (state, action) => {
            delete state.cartItems[action.payload];
        },
        changeQuantity: (state, action) => {
            state.cartItems[action.payload.id].quantity += action.payload.quantity;
        },
        updateCart: (state, action) => {
            state.cartItems = action.payload;
        },
        clearLocalCart:(state, action) => {
            return {};
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logoutAll, (state) => {
            return {};
        })
    }
});

export const {addToCart, removeFromCart, changeQuantity, updateCart, clearLocalCart } = cartSlice.actions;
export const cartSliceReducer = cartSlice.reducer;