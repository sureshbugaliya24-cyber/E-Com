'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { logoutUser } from '@/store/authSlice';
import { MapPin, LogOut, Download, Package } from 'lucide-react';

export default function AccountPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);

    // Typecast user due to Redux strictness
    const profile = user as any;

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            // Ideally fetch past orders here
            setOrders([]);
        }
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });

            // Clear local storage / redux
            dispatch(logoutUser());
            dispatch({ type: 'cart/setItems', payload: [] });
            dispatch({ type: 'wishlist/setItems', payload: [] });

            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (!profile) return null; // wait for redirect

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50">
            <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">My Account</h1>
                    <p className="text-gray-500">Welcome back, {profile.name}!</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-rose-600 hover:text-rose-800 font-medium transition-colors bg-rose-50 px-4 py-2 rounded-xl"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Addresses */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Details Box */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-900">{profile.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="font-medium text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Box */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <MapPin className="text-amber-600 w-5 h-5" />
                            <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                        </div>

                        {profile.addresses && profile.addresses.length > 0 ? (
                            <div className="space-y-4 h-64 overflow-y-auto pr-2">
                                {profile.addresses.map((addr: any) => (
                                    <div key={addr._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <p className="font-bold text-gray-900 text-sm mb-1">{addr.fullName}</p>
                                        <p className="text-gray-600 text-sm">{addr.street}</p>
                                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.phone}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">You haven't saved any addresses yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-full">
                        <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 pb-6">
                            <Package className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                        </div>

                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {/* Order cards would map here */}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No previous orders found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
