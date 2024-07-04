import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface ItemState {
    item: any;
    items: any;
    usedItems: any;
    itemError: string | null;
    itemMessage: string | null;
};

const initialState: ItemState = {
    item: {},
    items: [],
    usedItems: [],
    itemError: null,
    itemMessage: null,
};

export const itemSlice = createSlice({
    name: 'item',
    initialState,
    reducers: {
        setItem: (state, action: PayloadAction<any>) => {
            state.item = action.payload;
        },
        setItems: (state, action: PayloadAction<any>) => {
            state.items = action.payload;
        },
        setUsedItems: (state, action: PayloadAction<any>) => {
            state.usedItems = action.payload;
        },
        setItemMessage: (state, action: PayloadAction<any>) => {
            state.itemMessage = action.payload
        },
    }
});


export const { setItem, setItems, setUsedItems, setItemMessage } = itemSlice.actions;

export const itemReducer = itemSlice.reducer;