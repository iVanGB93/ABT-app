import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface ClientState {
    client: any;
    clients: any;
    clientMessage: string | null;
    clientError?: string | null;
    clientLoading?: boolean;
};

const initialState: ClientState = {
    client: {},
    clients: [],
    clientMessage: null,
    clientLoading: false,
};

export const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        setClientLoading: (state, action: PayloadAction<boolean>) => {
            state.clientLoading = action.payload;
        },
        clientSetMessage: (state, action: PayloadAction<string | null>) => {
            state.clientMessage = action.payload;
            state.clientError = null;
            state.clientLoading = false;
        },
        setClient: (state, action: PayloadAction<any>) => {
            state.client = action.payload;
            state.clientLoading = false;
        },
        setClients: (state, action: PayloadAction<any>) => {
            state.clients = action.payload;
            state.clientError = null;
            state.clientLoading = false;
        },
        clientFail: (state, action: PayloadAction<string>) => {
            state.clientError = action.payload;
            state.clientMessage = null;
            state.clientLoading = false;
        },
    }
});


export const { setClientLoading, clientSetMessage, setClient, setClients, clientFail } = clientSlice.actions;

export const clientReducer = clientSlice.reducer;

export default clientReducer;