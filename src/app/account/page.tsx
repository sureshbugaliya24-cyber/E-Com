'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '@/store/store';
import { logoutUser, setUser } from '@/store/authSlice';
import { MapPin, LogOut, Download, Package, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiUrl } from '@/utils/apiClient';

export default function AccountPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const { t } = useTranslation();

    // Address Edit States
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addrForm, setAddrForm] = useState({
        fullName: '', street: '', city: '', state: '', zipCode: '', country: 'India', phone: ''
    });

    // Typecast user due to Redux strictness
    const profile = user as any;

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            // Fetch past orders
            const fetchOrders = async () => {
                try {
                    const res = await fetch(getApiUrl('/api/orders'));
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
            await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });

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

    const handleEditAddress = (addr: any) => {
        setAddrForm(addr);
        setEditingAddressId(addr._id);
        setIsEditingAddress(true);
    };

    const handleAddAddressClick = () => {
        setAddrForm({ fullName: '', street: '', city: '', state: '', zipCode: '', country: 'India', phone: '' });
        setEditingAddressId(null);
        setIsEditingAddress(true);
    };

    const handleCancelAddress = () => {
        setIsEditingAddress(false);
        setEditingAddressId(null);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (editingAddressId) {
                res = await fetch(getApiUrl('/api/user/address'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: editingAddressId, ...addrForm })
                });
            } else {
                res = await fetch(getApiUrl('/api/user/address'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addrForm)
                });
            }
            if (res.ok) {
                const data = await res.json();
                dispatch(setUser(data.user));
                setIsEditingAddress(false);
            }
        } catch (e) {
            console.error('Error saving address', e);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        try {
            const res = await fetch(getApiUrl(`/api/user/address?id=${id}`), { method: 'DELETE' });
            if (res.ok) {
                const data = await res.json();
                dispatch(setUser(data.user));
            }
        } catch (e) {
            console.error('Error deleting address', e);
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
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="text-amber-600 w-5 h-5" />
                                <h2 className="text-xl font-bold text-gray-900">{t('account.savedAddresses')}</h2>
                            </div>
                            {!isEditingAddress && (
                                <button onClick={handleAddAddressClick} className="text-sm font-medium text-amber-600 hover:text-amber-800 flex items-center bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </button>
                            )}
                        </div>

                        {isEditingAddress ? (
                            <form onSubmit={handleSaveAddress} className="space-y-4">
                                <input type="text" placeholder="Full Name" required value={addrForm.fullName} onChange={(e) => setAddrForm(p => ({ ...p, fullName: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                <input type="text" placeholder="Street Address" required value={addrForm.street} onChange={(e) => setAddrForm(p => ({ ...p, street: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="City" required value={addrForm.city} onChange={(e) => setAddrForm(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                    <input type="text" placeholder="State" required value={addrForm.state} onChange={(e) => setAddrForm(p => ({ ...p, state: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="ZIP Code" required value={addrForm.zipCode} onChange={(e) => setAddrForm(p => ({ ...p, zipCode: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                    <input type="text" placeholder="Phone" required value={addrForm.phone} onChange={(e) => setAddrForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 inset ring-amber-500" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-amber-600 text-white font-medium py-3 rounded-xl hover:bg-amber-700 transition">Save</button>
                                    <button type="button" onClick={handleCancelAddress} className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                </div>
                            </form>
                        ) : profile.addresses && profile.addresses.length > 0 ? (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {profile.addresses.map((addr: any) => (
                                    <div key={addr._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 relative group">
                                        <p className="font-bold text-gray-900 text-sm mb-1">{addr.fullName}</p>
                                        <p className="text-gray-600 text-sm">{addr.street}</p>
                                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.phone}</p>
                                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditAddress(addr)} className="text-gray-400 hover:text-amber-600 transition-colors p-1" title="Edit Address">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-rose-600 transition-colors p-1" title="Delete Address">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
                                    <Link href={`/orders/${order._id}`} key={order._id} className="block p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{t('account.order')} #{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{t('account.orderDate')} {new Date(order.createdAt).toLocaleDateString()}</p>
                                            <div className="text-sm text-gray-700 mt-2">
                                                <span className="font-medium text-gray-900">{t('account.items')} </span>
                                                {order.items.map((i: any) => `${i.quantity}x ${i.name}${i.variationName ? ` (${i.variationName})` : ''}`).join(', ')}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:items-end space-y-2">
                                            <p className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 md:border-none md:pb-0">
                                                {/* In a multi-currency app, you would format properly based on currencyAtPurchase */}
                                                ₹{order.totalAmountINR.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </Link>
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
