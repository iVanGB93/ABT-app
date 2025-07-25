import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface BusinessState {
    businesses: any;
    businessMessage: string | null;
    businessError?: string | null;
    extraExpenses: any;
    extraIncome: any;
};

const initialState: BusinessState = {
    businesses: [],
    businessMessage: null,
    businessError: null,
    extraExpenses: [],
    extraIncome: [],
};

export const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
        businessSetMessage: (state, action: PayloadAction<string | null>) => {
            state.businessMessage = action.payload;
            state.businessError = null;
        },
        businessSetError: (state, action: PayloadAction<string | null>) => {
            state.businessError = action.payload;
            state.businessMessage = null;
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


export const { businessSetMessage, businessSetError, setBusinesses, setExtraExpenses, setExtraIncome } = businessSlice.actions;

export const businessReducer = businessSlice.reducer;

export default businessReducer;