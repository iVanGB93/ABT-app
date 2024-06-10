import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface AuthState {
    authLoading: boolean;
    token: string | null;
    refreshToken: string | null;
    userName: string | null;
    authError: string | null;
};

const initialState: AuthState = {
    authLoading: false,
    token: null,
    refreshToken: null,
    userName: null,
    authError: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authSetLoading: (state, action: PayloadAction<boolean>) => {
            state.authLoading = action.payload
        },
        authSuccess: (state, action: PayloadAction<{username: string, token: string, refreshToken: string}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.userName = action.payload.username
            state.authLoading = false;
            state.authError = null;
        },
        authFail: (state, action: PayloadAction<string>) => {
            state.authLoading = false;
            state.authError = action.payload;
        },
        authLogout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.authLoading = false;
            state.authError = null;
            state.userName = null;
        },
        setTokensAction: (state, action: PayloadAction<{token: string | null, refreshToken:string | null}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
    }
});

export const {authSetLoading, authSuccess, authFail, authLogout, setTokensAction} = authSlice.actions;

export const authReducer = authSlice.reducer;