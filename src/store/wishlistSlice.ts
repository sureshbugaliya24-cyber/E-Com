import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: string[]; // an array of productIds
}

const initialState: WishlistState = {
    items: [],
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlistItems: (state, action: PayloadAction<string[]>) => {
            state.items = action.payload;
        },
        toggleWishlist: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            if (state.items.includes(productId)) {
                state.items = state.items.filter((id) => id !== productId);
            } else {
                state.items.push(productId);
            }
        },
    },
});

export const { setWishlistItems, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
