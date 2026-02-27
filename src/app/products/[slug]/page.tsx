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
import { useTranslation } from '@/hooks/useTranslation';
import { getApiUrl } from '@/utils/apiClient';
import Breadcrumbs from '@/components/Breadcrumbs';

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

    // Variant Selection State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [matchedVariant, setMatchedVariant] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(getApiUrl(`/api/products/${slug}`));
                const data = await res.json();
                if (data.product) {
                    setProduct(data.product);

                    // Initialize Default Options
                    if (data.product.options && data.product.options.length > 0) {
                        const initialOpts: Record<string, string> = {};
                        data.product.options.forEach((opt: any) => {
                            if (opt.values && opt.values.length > 0) {
                                initialOpts[opt.name] = opt.values[0];
                            }
                        });
                        setSelectedOptions(initialOpts);
                    }

                    setActiveImage(data.product.images?.[0] || '');
                }
            } catch (error) {
                console.error('Failed to load product', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    // Matching Algorithm
    useEffect(() => {
        if (!product || !product.variations || product.variations.length === 0) return;

        // Check against variations array
        const match = product.variations.find((v: any) => {
            if (!v.attributes) return false;

            // For every selected option, check if the variant's attributes object has the exact match
            for (const [key, val] of Object.entries(selectedOptions)) {
                if (v.attributes[key] !== val) return false;
            }
            return true;
        });

        setMatchedVariant(match || null);

        // Sync active image if variant has a unique one
        if (match && match.images && match.images.length > 0) {
            setActiveImage(match.images[0]);
        } else if (product.images && product.images.length > 0) {
            setActiveImage(product.images[0]);
        }

    }, [selectedOptions, product]);

    const handleAddToCart = async () => {
        if (!product) return;

        const variationName = matchedVariant ? matchedVariant.sku : undefined;

        dispatch(addToCart({ productId: String(product._id), quantity, variationName }));
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
        try {
            await fetch(getApiUrl('/api/cart'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(product._id), quantity, variationName }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Loading details...</div>;
    if (!product) return <div className="min-h-screen pt-32 text-center text-xl">Product not found.</div>;

    const name = getLocalizedString(product.name, language);
    const description = getLocalizedString(product.description, language);
    const currentPriceINR = matchedVariant?.priceINR || product.basePriceINR;
    const price = formatCurrency(convertCurrency(currentPriceINR, currency), currency);

    const galleryImages = matchedVariant?.images?.length ? matchedVariant.images : product.images;
    const isWishlisted = wishlistItems.includes(String(product._id));

    // Disable Add To Cart if invalid combination or zero stock
    const isOutOfStock = product.options?.length > 0 ? (!matchedVariant || matchedVariant.stock <= 0) : (product.stock <= 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <Breadcrumbs items={[
                { label: 'Products', href: '/products' },
                { label: name }
            ]} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mt-6">
                {/* Images Section */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        {activeImage ? (
                            <Image
                                src={activeImage}
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
                    {/* Image Thumbnails */}
                    {galleryImages && galleryImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide">
                            {galleryImages.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border-2 transition-all ${activeImage === img ? 'border-amber-600 scale-105' : 'border-transparent hover:border-amber-300'}`}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
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

                    {/* Options/Variants Selectors */}
                    {product.options && product.options.length > 0 && (
                        <div className="mb-8 space-y-6">
                            {product.options.map((opt: any) => (
                                <div key={opt.name}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">{opt.name}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {opt.values.map((val: string) => {
                                            const isSelected = selectedOptions[opt.name] === val;
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                                    className={`px-5 py-3 rounded-xl border-2 font-medium transition-all text-sm ${isSelected ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}
                                                >
                                                    {val}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {product.options.length > 0 && !matchedVariant && (
                                <p className="text-rose-500 text-sm italic font-medium mt-2">This specific combination is currently unavailable.</p>
                            )}
                        </div>
                    )}

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
                            disabled={isAdded || isOutOfStock}
                            className={`flex-1 font-medium py-4 px-8 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-3 text-lg 
                                ${isOutOfStock ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed border border-gray-200' :
                                    isAdded ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30' : 'bg-gray-900 hover:bg-amber-600 text-white shadow-gray-900/10 hover:shadow-amber-600/30'}`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>{isOutOfStock ? 'Out of Stock' : isAdded ? 'Added!' : 'Add to Bag'}</span>
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
