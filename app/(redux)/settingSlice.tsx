import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface SettingState {
    loading: boolean;
    color: string;
    darkTheme: boolean,
    businessName: string,
    businessLogo: string | null,
};

const initialState: SettingState = {
    loading: false,
    color: '#6A5ACD',
    darkTheme: true,
    businessName: 'Business Name',
    businessLogo: null
};

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        settingLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setBusinessName: (state, action: PayloadAction<string>) => {
            state.businessName = action.payload
        },
        setBusinessLogo: (state, action: PayloadAction<any>) => {
            state.businessLogo = action.payload
        },
    }
});

export const {settingLoading, setBusinessName, setBusinessLogo} = settingSlice.actions;

export const settingReducer = settingSlice.reducer;