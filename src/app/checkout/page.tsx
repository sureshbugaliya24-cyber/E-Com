'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { ShoppingBag, MapPin, CreditCard, ChevronRight, Plus, Check } from 'lucide-react';
import { formatCurrency, convertCurrency } from '@/utils/currency';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);
    const cartItems = useSelector((state: any) => state.cart.items);
    const currency = useSelector((state: any) => state.ui.currency);

    // We would ideally fetch detailed product data for the cart, but for UI sake we simulate the total
    // In a real app we'd fetch the exact DB prices here to avoid client tampering.
    const [cartDetails, setCartDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [addresses, setAddresses] = useState<any[]>((user as any)?.addresses || []);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // New Address Form State
    const [newAddr, setNewAddr] = useState({ fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: '' });

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/checkout');
        } else {
            // Sync addresses from Redux when user changes (e.g. after adding one)
            setAddresses((user as any).addresses || []);
            fetchCartDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, cartItems]);

    const fetchCartDetails = async () => {
        try {
            // We'll hit the cart API to get the populated products
            const res = await fetch('/api/cart', {
                headers: { 'Cache-Control': 'no-cache' }
            });
            const data = await res.json();
            if (data.cart && data.cart.items) {
                setCartDetails(data.cart.items || []);
            } else {
                setCartDetails([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddr)
            });
            if (res.ok) {
                const data = await res.json();
                
                // Update local state
                setAddresses(data.user.addresses);
                
                // CRITICAL: Update Redux state so other pages/refreshes have the latest data
                dispatch({ type: 'auth/setUser', payload: data.user });
                
                setShowAddressForm(false);
                setNewAddr({ fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: '' });
            }
        } catch (err) {
            console.error('Failed to add address', err);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return alert('Please select a shipping address');
        if (cartDetails.length === 0) return alert('Your cart is empty');

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: selectedAddressId,
                    currency
                })
            });

            if (res.ok) {
                const data = await res.json();

                // Flush the Redux cart successfully
                dispatch(setCartItems([]));

                // Redirect to success page or clear cart
                router.push(`/checkout/success?orderId=${data.order._id}`);
            } else {
                const err = await res.json();
                alert(err.error || 'Checkout failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong during checkout.');
        }
    };

    if (!user) return null; // Wait for redirect
    if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Loading checkout...</div>;

    const safeCartDetails = (Array.isArray(cartDetails) ? cartDetails : []).filter(item => item && item.product);
    const subtotalINR = safeCartDetails.reduce((acc, item) => acc + ((item.product?.basePriceINR || 0) * item.quantity), 0) || 0;
    const subtotal = convertCurrency(subtotalINR, currency);
    const total = subtotal; // Assuming free shipping

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-10">Secure Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-12">

                {/* Left Column - Addresses & Payment */}
                <div className="lg:w-2/3 space-y-8">

                    {/* Address Selection */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <MapPin className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                        </div>

                        {addresses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddressId(addr._id)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-900">{addr.fullName}</p>
                                            {selectedAddressId === addr._id && <Check className="text-amber-600 w-5 h-5 bg-amber-100 rounded-full p-0.5" />}
                                        </div>
                                        <p className="text-gray-600 text-sm">{addr.street}</p>
                                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p className="text-gray-600 text-sm mt-2">{addr.phone}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-6 italic">No addresses saved yet.</p>
                        )}

                        {!showAddressForm ? (
                            <button onClick={() => setShowAddressForm(true)} className="flex items-center text-amber-600 font-medium hover:text-amber-800 transition-colors">
                                <Plus className="w-5 h-5 mr-1" /> Add New Address
                            </button>
                        ) : (
                            <form onSubmit={handleAddAddress} className="mt-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">New Address Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input required placeholder="Full Name" value={newAddr.fullName} onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                    <input required placeholder="Phone Number" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                    <input required placeholder="Street Address" value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none sm:col-span-2" />
                                    <input required placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                    <input required placeholder="State / Province" value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                    <input required placeholder="ZIP / Postal Code" value={newAddr.zipCode} onChange={e => setNewAddr({ ...newAddr, zipCode: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                    <input required placeholder="Country" value={newAddr.country} onChange={e => setNewAddr({ ...newAddr, country: e.target.value })} className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="flex justify-end mt-4 space-x-3">
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-gray-900 text-white font-medium hover:bg-amber-600 rounded-xl transition-colors">Save Address</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Dummy Payment Block */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <CreditCard className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                        </div>
                        <div className="p-5 rounded-2xl border-2 border-amber-600 bg-amber-50 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                                <p className="text-gray-600 text-sm">Pay when your jewellery arrives.</p>
                            </div>
                            <Check className="text-amber-600 w-6 h-6 bg-amber-100 rounded-full p-1" />
                        </div>
                    </div>

                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                        <div className="flex items-center space-x-3 mb-6">
                            <ShoppingBag className="text-amber-600 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                        </div>

                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                            {safeCartDetails.map((item) => (
                                <div key={item.product?._id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 line-clamp-1">{item.product.name?.en || item.product.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 ml-4">
                                        {formatCurrency(convertCurrency(item.product.basePriceINR * item.quantity, currency), currency)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-6 space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Insured Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                                <span>Total</span>
                                <span>{formatCurrency(total, currency)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center transition-all shadow-xl ${selectedAddressId && cartDetails.length > 0 ? 'bg-gray-900 text-white hover:bg-amber-600 hover:shadow-amber-600/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            Place Order <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
