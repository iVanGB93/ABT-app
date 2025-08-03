import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface SettingState {
    color: string;
    darkTheme: boolean,
    business: any,
    profile: any,
    message: string | null,
    error: string | null,
};

const initialState: SettingState = {
    color: '#009d93',
    darkTheme: true,
    business: {},
    profile: {},
    message: null,
    error: null,
};

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        setBusiness: (state, action: PayloadAction<any>) => {
            state.business = action.payload
        },
        setProfile: (state, action: PayloadAction<any>) => {
            state.profile = action.payload
        },
        setColor: (state, action: PayloadAction<string>) => {
            state.color = action.payload
        },
        cleanSettings: (state) => {
            state.business = {};
            state.profile = {};
        },
        setDarkTheme: (state, action: PayloadAction<boolean>) => {
            state.darkTheme = action.payload
        },
        setMessage: (state, action: PayloadAction<string | null>) => {
            state.message = action.payload;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.message = null;
        },
    }
});

export const {setBusiness, setProfile, setColor, setDarkTheme, setMessage, setError, cleanSettings} = settingSlice.actions;

export const settingReducer = settingSlice.reducer;
export default settingSlice.reducer;