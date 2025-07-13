import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface BusinessState {
    businesses: any;
    businessMessage: string | null;
    extraExpenses: any;
    extraIncome: any;
};

const initialState: BusinessState = {
    businesses: [],
    businessMessage: null,
    extraExpenses: [],
    extraIncome: [],
};

export const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
        businessSetMessage: (state, action: PayloadAction<string | null>) => {
            state.businessMessage = action.payload;
        },
        setBusinesses: (state, action: PayloadAction<any>) => {
            state.businesses = action.payload;
        },
        setExtraExpenses: (state, action: PayloadAction<any>) => {
            state.extraExpenses = action.payload;
        },
        setExtraIncome: (state, action: PayloadAction<any>) => {
            state.extraIncome = action.payload;
        },
    }
});


export const { businessSetMessage, setBusinesses, setExtraExpenses, setExtraIncome } = businessSlice.actions;

export const businessReducer = businessSlice.reducer;

export default businessReducer;