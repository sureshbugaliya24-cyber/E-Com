'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { logoutUser } from '@/store/authSlice';
import { MapPin, LogOut, Download, Package } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AccountPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const { t } = useTranslation();

    // Typecast user due to Redux strictness
    const profile = user as any;

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            // Fetch past orders
            const fetchOrders = async () => {
                try {
                    const res = await fetch('/api/orders');
                    if (res.ok) {
                        const data = await res.json();
                        setOrders(data.orders || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch orders', err);
                }
            };
            fetchOrders();
        }
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });

            // Clear local storage / redux
            localStorage.removeItem('cartItems');
            localStorage.removeItem('wishlistItems');
            dispatch(logoutUser());
            dispatch({ type: 'cart/setCartItems', payload: [] });
            dispatch({ type: 'wishlist/setWishlistItems', payload: [] });

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
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{t('account.title')}</h1>
                    <p className="text-gray-500">{t('account.welcome')}, {profile.name}!</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-rose-600 hover:text-rose-800 font-medium transition-colors bg-rose-50 px-4 py-2 rounded-xl"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    {t('account.logout')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {/* Details Box */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('account.profileDetails')}</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('account.fullName')}</p>
                                <p className="font-medium text-gray-900">{profile.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('account.email')}</p>
                                <p className="font-medium text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Box */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <MapPin className="text-amber-600 w-5 h-5" />
                            <h2 className="text-xl font-bold text-gray-900">{t('account.savedAddresses')}</h2>
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
                            <p className="text-gray-500 text-sm italic">{t('account.noAddresses')}</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-full">
                        <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 pb-6">
                            <Package className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-gray-900">{t('account.orderHistory')}</h2>
                        </div>

                        {orders.length > 0 ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {orders.map((order: any) => (
                                    <div key={order._id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-gray-900">{t('account.order')} #{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                    order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{t('account.orderDate')} {new Date(order.createdAt).toLocaleDateString()}</p>
                                            <div className="text-sm text-gray-700 mt-2">
                                                <span className="font-medium text-gray-900">{t('account.items')} </span>
                                                {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:items-end space-y-2">
                                            <p className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 md:border-none md:pb-0">
                                                {/* In a multi-currency app, you would format properly based on currencyAtPurchase */}
                                                ₹{order.totalAmountINR.toLocaleString('en-IN')}
                                            </p>
                                            <button className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors flex items-center">
                                                <Download className="w-4 h-4 mr-1" /> {t('account.invoice')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">{t('account.noOrders')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
