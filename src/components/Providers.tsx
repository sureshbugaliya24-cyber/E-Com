'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect, useState } from 'react';
import { setCartItems } from '@/store/cartSlice';
import { setLanguage, setCurrency } from '@/store/uiSlice';

function StateSync({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Hydrate from localStorage
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) store.dispatch(setCartItems(JSON.parse(savedCart)));

        const savedLang = localStorage.getItem('language');
        if (savedLang) store.dispatch(setLanguage(savedLang as 'en' | 'hi'));

        const savedCurr = localStorage.getItem('currency');
        if (savedCurr) store.dispatch(setCurrency(savedCurr));

        const savedWishlist = localStorage.getItem('wishlistItems');
        if (savedWishlist) store.dispatch({ type: 'wishlist/setWishlistItems', payload: JSON.parse(savedWishlist) });

        setIsMounted(true);

        // Intelligently hydrate User Context via HTTP-Only Cookies on app initialization.
        // If Auth succeeds, override Redux with Live DB configurations.
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : Promise.reject('Not Auth'))
            .then(data => {
                if (data.user) {
                    store.dispatch({ type: 'auth/setUser', payload: data.user });

                    // Hydrate Live DB state into Redux explicitly
                    fetch('/api/cart').then(r => r.json()).then(c => {
                        if (c.cart && c.cart.items) {
                            // Normalize: ensure productId is a string if it was populated
                            const normalizedItems = c.cart.items.map((item: any) => ({
                                productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
                                quantity: item.quantity
                            }));
                            store.dispatch(setCartItems(normalizedItems));
                        }
                    });
                    fetch('/api/wishlist').then(r => r.json()).then(w => {
                        if (w.wishlist && w.wishlist.products) {
                            // Normalize: ensure each product is just a string ID
                            const normalizedProducts = w.wishlist.products.map((p: any) => 
                                typeof p === 'object' ? p._id : p
                            );
                            store.dispatch({ type: 'wishlist/setWishlistItems', payload: normalizedProducts });
                        }
                    });
                }
            }).catch(() => { });

        // Subscribe to changes securely
        const unsubscribe = store.subscribe(() => {
            const state = store.getState() as any;

            // Strictly decouple Guest localStorage persistence from Authenticated sessions.
            if (!state.auth.user) {
                localStorage.setItem('cartItems', JSON.stringify(state.cart.items));
                localStorage.setItem('wishlistItems', JSON.stringify(state.wishlist.items));
            } else {
                localStorage.removeItem('cartItems');
                localStorage.removeItem('wishlistItems');
            }

            localStorage.setItem('language', state.ui.language);
            localStorage.setItem('currency', state.ui.currency);
        });

        return () => unsubscribe();
    }, []);

    // Prevent hydration mismatch by rendering nothing until mounted
    if (!isMounted) return null;

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <StateSync>
                {children}
            </StateSync>
        </Provider>
    );
}
