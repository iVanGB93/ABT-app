import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface ClientState {
    client: any;
    clients: any;
    clientMessage: string | null;
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
    }
});


export const { clientSetMessage, setClient, setClients } = clientSlice.actions;

export const clientReducer = clientSlice.reducer;