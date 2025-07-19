import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface ClientState {
    client: any;
    clients: any;
    clientMessage: string | null;
    clientError?: string | null;
};

const initialState: ClientState = {
    client: {},
    clients: [],
    clientMessage: null,
};

export const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        clientSetMessage: (state, action: PayloadAction<string | null>) => {
            state.clientMessage = action.payload;
        },
        setClient: (state, action: PayloadAction<any>) => {
            state.client = action.payload;
        },
        setClients: (state, action: PayloadAction<any>) => {
            state.clients = action.payload;
        },
        clientFail: (state, action: PayloadAction<string>) => {
            state.clientError = action.payload;
            state.clientMessage = null;
        },
    }
});


export const { clientSetMessage, setClient, setClients, clientFail } = clientSlice.actions;

export const clientReducer = clientSlice.reducer;

export default clientReducer;