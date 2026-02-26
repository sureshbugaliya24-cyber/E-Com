import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    language: 'en' | 'hi';
    currency: string;
}

const initialState: UiState = {
    language: 'en',
    currency: 'INR',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<'en' | 'hi'>) => {
            state.language = action.payload;
        },
        setCurrency: (state, action: PayloadAction<string>) => {
            state.currency = action.payload;
        },
    },
});

export const { setLanguage, setCurrency } = uiSlice.actions;
export default uiSlice.reducer;
