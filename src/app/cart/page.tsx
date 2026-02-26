'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedString } from '@/utils/language';
import { formatCurrency, convertCurrency } from '@/utils/currency';
import { setCartItems, updateCartItemQuantity } from '@/store/cartSlice';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CartPage() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.cart.items);
    const language = useSelector((state: any) => state.ui.language);
    const currency = useSelector((state: any) => state.ui.currency);
    const { t } = useTranslation();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch product details for items in cart
        const fetchProducts = async () => {
            if (cartItems.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const ids = cartItems.map((item: any) => item.productId).join(',');
                const res = await fetch(`/api/products?ids=${ids}`);
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Failed to load products for cart', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [cartItems]);

    const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        // Optimistic UI Update
        dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));

        try {
            await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: newQuantity })
            });
        } catch (error) {
            console.error('Failed to update quantity', error);
        }
    };

    const handleRemove = async (productId: string) => {
        // Optimistic UI Removal
        const newCart = cartItems.filter((item: any) => item.productId !== productId);
        dispatch(setCartItems(newCart));

        try {
            await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 0 })
            });
        } catch (error) {
            console.error('Failed to remove item', error);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-20 text-center">Loading cart...</div>;
    }

    // Filter items to ensure we only count products that actually exist in the DB
    const validItems = cartItems.filter((item: any) => products.find(p => String(p._id) === item.productId));

    if (cartItems.length === 0 || (!loading && validItems.length === 0)) {
        return (
            <div className="min-h-screen pt-32 text-center px-4">
                <h1 className="text-3xl font-serif text-gray-900 mb-6">{t('cart.emptyTitle')}</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('cart.emptyDesc')}</p>
                <Link href="/" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors">
                    {t('cart.startShopping')}
                </Link>
            </div>
        );
    }

    let cartTotal = 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-10 border-b-2 border-amber-600 inline-block pb-2">{t('cart.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {validItems.map((cartItem: any) => {
                        const product = products.find(p => String(p._id) === cartItem.productId);
                        if (!product) return null;

                        const name = getLocalizedString(product.name, language);
                        const itemPrice = convertCurrency(product.basePriceINR, currency);
                        const lineTotal = itemPrice * cartItem.quantity;
                        cartTotal += lineTotal;

                        return (
                            <div key={cartItem.productId} className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                                <div className="relative w-32 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                    {product.images?.[0] ? (
                                        <Image src={product.images[0]} alt={name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="sm:ml-8 mt-4 sm:mt-0 flex-grow text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

                                    <div className="flex items-center justify-center sm:justify-start space-x-4 mb-3 border border-gray-200 w-fit rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => handleUpdateQuantity(cartItem.productId, cartItem.quantity - 1)}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                                            disabled={cartItem.quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium text-gray-900 px-2 min-w-[2rem] text-center">
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(cartItem.productId, cartItem.quantity + 1)}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(lineTotal, currency)}</p>
                                </div>
                                <button
                                    onClick={() => handleRemove(cartItem.productId)}
                                    className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 sm:ml-6 p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                    title="Remove Item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 h-fit sticky top-24">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">{t('cart.orderSummary')}</h2>

                    <div className="flex justify-between items-center mb-4 text-gray-600">
                        <span>{t('cart.subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(cartTotal, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-gray-600">
                        <span>{t('cart.shipping')}</span>
                        <span className="text-green-600 font-medium">{t('cart.free')}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                        <span className="text-2xl font-bold text-amber-600">{formatCurrency(cartTotal, currency)}</span>
                    </div>

                    <Link href="/checkout" className="w-full bg-gray-900 hover:bg-amber-600 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-md shadow-gray-900/10 hover:shadow-amber-600/30 text-lg flex justify-center text-center">
                        {t('cart.proceed')}
                    </Link>

                    <div className="mt-6 text-sm text-center text-gray-500 flex items-center justify-center space-x-2">
                        <span>{t('cart.encryption')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
