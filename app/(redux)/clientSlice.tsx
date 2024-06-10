import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface ClientState {
    clientLoading: boolean;
    client: any;
    clients: any;
    clientError: string | null;
};

const initialState: ClientState = {
    clientLoading: false,
    client: {},
    clients: [],
    clientError: null,
};

export const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        clientSetLoading: (state, action: PayloadAction<boolean>) => {
            state.clientLoading = action.payload;
        },
        setClient: (state, action: PayloadAction<any>) => {
            state.client = action.payload;
            state.clientLoading = false;
            state.clientError = null;
        },
        setClients: (state, action: PayloadAction<any>) => {
            state.clients = action.payload;
            state.clientLoading = false;
            state.clientError = null;
        },
        clientFail: (state, action: PayloadAction<string>) => {
            state.clientLoading = false;
            state.clientError = action.payload;
        },
    }
});


export const { clientSetLoading, setClient, setClients, clientFail } = clientSlice.actions;

export const clientReducer = clientSlice.reducer;