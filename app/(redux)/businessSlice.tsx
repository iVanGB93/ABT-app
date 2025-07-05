import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface BusinessState {
    business: any;
    businesses: any;
    businessMessage: string | null;
};

const initialState: BusinessState = {
    business: {},
    businesses: [],
    businessMessage: null,
};

export const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
        businessSetMessage: (state, action: PayloadAction<string | null>) => {
            state.businessMessage = action.payload;
        },
        setBusiness: (state, action: PayloadAction<any>) => {
            state.business = action.payload;
        },
        setBusinesses: (state, action: PayloadAction<any>) => {
            state.businesses = action.payload;
        },
    }
});


export const { businessSetMessage, setBusiness, setBusinesses } = businessSlice.actions;

export const businessReducer = businessSlice.reducer;

export default businessReducer;