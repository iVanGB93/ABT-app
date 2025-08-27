import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ItemState {
    item: any;
    items: any;
    usedItems: any;
    itemError: string | null;
    itemMessage: string | null;
    itemLoading: boolean;
};

const initialState: ItemState = {
    item: {},
    items: [],
    usedItems: [],
    itemError: null,
    itemMessage: null,
    itemLoading: false,
};

export const itemSlice = createSlice({
    name: 'item',
    initialState,
    reducers: {
        setItem: (state, action: PayloadAction<any>) => {
            state.item = action.payload;
            state.itemLoading = false;
            state.itemError = null;
        },
        setItems: (state, action: PayloadAction<any>) => {
            state.items = action.payload;
            state.itemLoading = false;
            state.itemError = null;
        },
        setUsedItems: (state, action: PayloadAction<any>) => {
            state.usedItems = action.payload;
            state.itemLoading = false;
            state.itemError = null;
        },
        setItemMessage: (state, action: PayloadAction<any>) => {
            state.itemMessage = action.payload
            state.itemLoading = false;
            state.itemError = null;
        },
        setItemLoading: (state, action: PayloadAction<boolean>) => {
            state.itemLoading = action.payload;
            state.itemError = null;
            state.itemMessage = null;
        },
        itemFail: (state, action: PayloadAction<string | null>) => {
            state.itemError = action.payload;
            state.itemLoading = false;
            state.itemMessage = null;
        },
    }
});

export const { setItem, setItems, setUsedItems, setItemMessage, setItemLoading, itemFail } = itemSlice.actions;

export const itemReducer = itemSlice.reducer;
export default itemSlice.reducer;