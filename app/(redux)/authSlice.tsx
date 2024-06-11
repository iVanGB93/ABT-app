import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    userName: string | null;
    authMessage: string | null;
};

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    userName: null,
    authMessage: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authSuccess: (state, action: PayloadAction<{username: string, token: string, refreshToken: string}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.userName = action.payload.username
        },
        authLogout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.userName = null;
        },
        authSetMessage: (state, action: PayloadAction<string | null>) => {
            state.authMessage = action.payload
        },
        setTokensAction: (state, action: PayloadAction<{token: string | null, refreshToken:string | null}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
    }
});

export const {authSuccess, authLogout, setTokensAction, authSetMessage} = authSlice.actions;

export const authReducer = authSlice.reducer;