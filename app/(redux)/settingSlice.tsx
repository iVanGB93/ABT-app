import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface SettingState {
    color: string;
    darkTheme: boolean,
    businessName: string,
    businessLogo: any,
    business: any,
};

const initialState: SettingState = {
    color: '#009d93',
    darkTheme: true,
    businessName: 'Business Name',
    businessLogo: null,
    business: {},
};

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        setBusiness: (state, action: PayloadAction<any>) => {
            state.business = action.payload
        },
        setBusinessName: (state, action: PayloadAction<string>) => {
            state.businessName = action.payload
        },
        setBusinessLogo: (state, action: PayloadAction<any>) => {
            state.businessLogo = action.payload
        },
        setColor: (state, action: PayloadAction<string>) => {
            state.color = action.payload
        },
        setDarkTheme: (state, action: PayloadAction<boolean>) => {
            state.darkTheme = action.payload
        },
    }
});

export const {setBusiness, setBusinessName, setBusinessLogo, setColor, setDarkTheme} = settingSlice.actions;

export const settingReducer = settingSlice.reducer;