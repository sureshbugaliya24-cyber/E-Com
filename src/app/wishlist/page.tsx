'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedString } from '@/utils/language';
import { formatCurrency, convertCurrency } from '@/utils/currency';
import { toggleWishlist } from '@/store/wishlistSlice';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { addToCart } from '@/store/cartSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function WishlistPage() {
    const dispatch = useDispatch();
    const wishlistItems = useSelector((state: any) => state.wishlist.items);
    const language = useSelector((state: any) => state.ui.language);
    const currency = useSelector((state: any) => state.ui.currency);
    const { t } = useTranslation();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Fetch product details for items in wishlist
        const fetchProducts = async () => {
            if (wishlistItems.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const ids = wishlistItems.join(',');
                const res = await fetch(`/api/products?ids=${ids}`);
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Failed to load products for wishlist', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [wishlistItems]);

    const handleRemoveWishlist = async (productId: string) => {
        // Optimistic UI Removal
        dispatch(toggleWishlist(productId));

        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
        } catch (error) {
            console.error('Failed to remove wishlist item', error);
        }
    };

    const handleAddToCart = async (productId: string) => {
        // Optimistic UI addition
        dispatch(addToCart({ productId, quantity: 1 }));

        setAddedStates(prev => ({ ...prev, [productId]: true }));
        setTimeout(() => {
            setAddedStates(prev => ({ ...prev, [productId]: false }));
        }, 2500);

        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-20 text-center">Loading wishlist...</div>;
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen pt-32 text-center px-4">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h1 className="text-3xl font-serif text-gray-900 mb-6">{t('wishlist.emptyTitle')}</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('wishlist.emptyDesc')}</p>
                <Link href="/" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors">
                    {t('wishlist.startShopping')}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-10 border-b-2 border-amber-600 inline-block pb-2">{t('wishlist.title')}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlistItems.map((productId: string) => {
                    const product = products.find(p => String(p._id) === productId);
                    if (!product) return null;

                    const name = getLocalizedString(product.name, language);
                    const price = formatCurrency(convertCurrency(product.basePriceINR, currency), currency);

                    return (
                        <div key={productId} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            <div className="relative h-64 w-full bg-gray-100">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}

                                <button
                                    onClick={() => handleRemoveWishlist(productId)}
                                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 hover:text-amber-600 transition-colors z-10 shadow-sm"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                <Link href={`/products/${product.slug}`}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-amber-600 transition-colors line-clamp-1">
                                        {name}
                                    </h3>
                                </Link>

                                <div className="mt-auto pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xl font-bold text-gray-900">{price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(productId)}
                                        disabled={addedStates[productId]}
                                        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium shadow-md ${addedStates[productId] ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-amber-600 text-white'}`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{addedStates[productId] ? 'Added!' : t('wishlist.moveToCart')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
