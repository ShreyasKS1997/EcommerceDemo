import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
    name: 'location',
    initialState: {
        pincode: null,
        city: '',
    },
    reducers: {
        setLocationPincode: (state, action) => {
            state.pincode = action.payload;
        },
        setLocationCity: (state, action) => {
            state.city = action.payload;
        }
    }
});

export const {setLocationPincode, setLocationCity} = locationSlice.actions;
export default locationSlice.reducer;