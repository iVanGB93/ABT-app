import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface SettingState {
    color: string;
    darkTheme: boolean,
    business: any,
    message: string | null,
};

const initialState: SettingState = {
    color: '#009d93',
    darkTheme: true,
    business: {},
    message: null,
};

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        setBusiness: (state, action: PayloadAction<any>) => {
            state.business = action.payload
        },
        setColor: (state, action: PayloadAction<string>) => {
            state.color = action.payload
        },
        setDarkTheme: (state, action: PayloadAction<boolean>) => {
            state.darkTheme = action.payload
        },
        setMessage: (state, action: PayloadAction<string | null>) => {
            state.message = action.payload
        },
    }
});

export const {setBusiness, setColor, setDarkTheme, setMessage} = settingSlice.actions;

export const settingReducer = settingSlice.reducer;
export default settingSlice.reducer;