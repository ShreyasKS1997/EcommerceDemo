import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
    name: 'order',
    initialState: {},
    reducers: {
        addShipppingInfo: (state, action) => {
            state.ShippingInfo = action.payload;
        },
        addOrderInfo: (state, action) => {
            state.OrderInfo = action.payload;
        },
        resetState: (state, action) => {
            return {};
        },
    }
});

export default orderSlice.reducer;
export const {addShipppingInfo, addOrderInfo, resetState} = orderSlice.actions;