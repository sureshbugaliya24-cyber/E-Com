'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { setCartItems } from '@/store/cartSlice';
import { setWishlistItems } from '@/store/wishlistSlice';
import Link from 'next/link';
import { getApiUrl } from '@/utils/apiClient';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('registered') === 'true') setRegistered(true);
        }
    }, []);

    const cartItems = useSelector((state: any) => state.cart.items);
    const wishlistItems = useSelector((state: any) => state.wishlist.items);
    const user = useSelector((state: any) => state.auth.user);

    useEffect(() => {
        if (user) {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                router.push(params.get('redirect') || '/account');
            } else {
                router.push('/account');
            }
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            dispatch(setUser(data.user));

            // --- Post-Login Store Sync ---
            try {
                const syncRes = await fetch(getApiUrl('/api/auth/sync'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems, wishlistItems }),
                });

                if (syncRes.ok) {
                    const syncData = await syncRes.json();

                    // Force refresh Redux with the newly merged DB state
                    dispatch(setCartItems(syncData.cart));
                    dispatch(setWishlistItems(syncData.wishlist));
                }
            } catch (syncErr) {
                console.error('Failed to sync offline items on login', syncErr);
            }

            // Redirect user (to checkout if returning from there)
            const params = new URLSearchParams(window.location.search);
            router.push(params.get('redirect') || '/account');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-serif font-bold mb-4 text-center text-gray-900">Sign in</h2>
            {registered && <p className="text-green-600 mb-4 text-center text-sm bg-green-50 p-3 rounded-lg border border-green-100 font-medium">Account created successfully! Please log in.</p>}
            {error && <p className="text-red-500 mb-6 text-center text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-amber-500 focus:border-amber-500 py-2.5 px-4 border transition-shadow"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-amber-500 focus:border-amber-500 py-2.5 px-4 border transition-shadow"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-md mt-4"
                >
                    Sign In
                </button>
            </form>

            <p className="mt-8 text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-amber-600 font-bold hover:underline">
                    Sign up here
                </Link>
            </p>
        </div>
    );
}
