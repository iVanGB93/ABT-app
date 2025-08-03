import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    userName: string | null;
    authMessage: string | null;
    code: number | null;
    userEmail: string | null;
};

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    userName: null,
    authMessage: null,
    code: null,
    userEmail: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authSuccess: (state, action: PayloadAction<{username: string, token: string, refreshToken: string}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.userName = action.payload.username
            state.authMessage = "Login successful";
        },
        authLogout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.userName = null;
            state.userEmail = null;
            state.code = null;
            state.authMessage = "Logged out successfully";
        },
        authSetMessage: (state, action: PayloadAction<string | null>) => {
            state.authMessage = action.payload
        },
        setTokensAction: (state, action: PayloadAction<{token: string | null, refreshToken:string | null}>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
        setCodeAndEmail: (state, action: PayloadAction<{code: number | null, email:string | null}>) => {
            state.code = action.payload.code;
            state.userEmail = action.payload.email;
        },
    }
});

export const {authSuccess, authLogout, setTokensAction, authSetMessage, setCodeAndEmail} = authSlice.actions;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;