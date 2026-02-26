'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { getLocalizedString } from '@/utils/language';
import { formatCurrency, convertCurrency } from '@/utils/currency';
import { addToCart } from '@/store/cartSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import { Heart, ShoppingBag, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SingleProductPage() {
    const params = useParams();
    const slug = params.slug;

    const dispatch = useDispatch();
    const language = useSelector((state: any) => state.ui.language);
    const currency = useSelector((state: any) => state.ui.currency);
    const wishlistItems = useSelector((state: any) => state.wishlist.items);

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${slug}`);
                const data = await res.json();
                if (data.product) {
                    setProduct(data.product);
                }
            } catch (error) {
                console.error('Failed to load product', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    const handleAddToCart = async () => {
        if (!product) return;

        dispatch(addToCart({ productId: String(product._id), quantity }));
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(product._id), quantity }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Loading details...</div>;
    if (!product) return <div className="min-h-screen pt-32 text-center text-xl">Product not found.</div>;

    const name = getLocalizedString(product.name, language);
    const description = getLocalizedString(product.description, language);
    const price = formatCurrency(convertCurrency(product.basePriceINR, currency), currency);
    const isWishlisted = wishlistItems.includes(String(product._id));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <Link href="/products" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Images Section */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={name}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <button
                            onClick={() => dispatch(toggleWishlist(String(product._id)))}
                            className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-rose-500 transition-colors shadow-lg"
                        >
                            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="text-sm font-bold tracking-widest text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full">{product.category}</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-gray-900 mt-4 mb-4 leading-tight">
                        {name}
                    </h1>

                    <p className="text-3xl font-bold text-gray-900 mb-8">{price}</p>

                    <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        {/* Quantity UI */}
                        <div className="flex items-center justify-between border-2 border-gray-200 rounded-2xl w-full sm:w-40 bg-white">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-5 py-4 text-gray-500 hover:text-amber-600 hover:bg-gray-50 rounded-l-2xl transition-colors"
                            >
                                -
                            </button>
                            <span className="font-bold text-lg">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-5 py-4 text-gray-500 hover:text-amber-600 hover:bg-gray-50 rounded-r-2xl transition-colors"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex-1 font-medium py-4 px-8 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-3 text-lg ${isAdded ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30' : 'bg-gray-900 hover:bg-amber-600 text-white shadow-gray-900/10 hover:shadow-amber-600/30'}`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>{isAdded ? 'Added!' : 'Add to Bag'}</span>
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                        <div className="flex items-center space-x-3 text-gray-600">
                            <Truck className="w-6 h-6 text-amber-600" />
                            <span className="font-medium text-sm">Free Insured Shipping</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                            <ShieldCheck className="w-6 h-6 text-amber-600" />
                            <span className="font-medium text-sm">Lifetime Warranty</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
