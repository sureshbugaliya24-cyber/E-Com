import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    productId: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingIndex = state.items.findIndex(item => item.productId === action.payload.productId);
            if (existingIndex >= 0) {
                state.items[existingIndex].quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        updateCartItemQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
            const existingIndex = state.items.findIndex(item => item.productId === action.payload.productId);
            if (existingIndex >= 0) {
                state.items[existingIndex].quantity = action.payload.quantity;
            }
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
    },
});

export const { setCartItems, toggleCart, addToCart, updateCartItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;
