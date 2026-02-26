'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { formatCurrency, convertCurrency } from '@/utils/currency';
import { getLocalizedString } from '@/utils/language';
import { toggleWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { IProduct } from '@/models/Product';
import { Heart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useDispatch();
    const language = useSelector((state: any) => state.ui.language);
    const currency = useSelector((state: any) => state.ui.currency);
    const wishlistItems = useSelector((state: any) => state.wishlist.items);

    const [isAdded, setIsAdded] = useState(false);

    const isWishlisted = wishlistItems.includes(String(product._id));

    const handleAddToCart = async () => {
        try {
            // Optimistic UI update
            dispatch(addToCart({ productId: String(product._id), quantity: 1 }));
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2500);

            // Sync with DB
            await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: String(product._id), quantity: 1 }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    const name = getLocalizedString(product.name, language);
    const price = formatCurrency(convertCurrency(product.basePriceINR, currency), currency);

    return (
        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
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
                    onClick={() => dispatch(toggleWishlist(String(product._id)))}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-rose-500 transition-colors z-10 shadow-sm"
                >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
            </div>

            <div className="p-5">
                <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-2">
                    {product.category}
                </div>

                <Link href={`/products/${product.slug}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-amber-600 transition-colors line-clamp-1">
                        {name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-bold text-gray-900">{price}</p>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-md ${isAdded ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-gray-900 hover:bg-amber-600 text-white shadow-gray-900/10 hover:shadow-amber-600/20'}`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isAdded ? 'Added!' : 'Add'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
