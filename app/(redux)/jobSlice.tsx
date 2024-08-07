import { PayloadAction, createSlice } from '@reduxjs/toolkit';


export interface JobState {
    jobLoading: boolean;
    job: any;
    jobs: any;
    jobError: string | null;
    jobMessage: string | null;
    invoice: any,
    charges: any,
};

const initialState: JobState = {
    jobLoading: false,
    job: {},
    jobs: [],
    jobError: null,
    jobMessage: null,
    invoice: {},
    charges: [],
};

export const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setJob: (state, action: PayloadAction<any>) => {
            state.job = action.payload;
            state.jobLoading = false;
            state.jobError = null;
        },
        setJobs: (state, action: PayloadAction<any>) => {
            state.jobs = action.payload;
            state.jobLoading = false;
            state.jobError = null;
        },
        jobFail: (state, action: PayloadAction<string>) => {
            state.jobLoading = false;
            state.jobError = action.payload;
        },
        setJobMessage: (state, action: PayloadAction<any>) => {
            state.jobMessage = action.payload;
        },
        setInvoice: (state, action: PayloadAction<any>) => {
            state.invoice = action.payload;
            state.jobLoading = false;
            state.jobError = null;
        },
        setCharges: (state, action: PayloadAction<any>) => {
            state.charges = action.payload;
            state.jobLoading = false;
            state.jobError = null;
        },
    }
});


export const { setJobMessage, setJob, setJobs, jobFail, setInvoice, setCharges } = jobSlice.actions;

export const jobReducer = jobSlice.reducer;