'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { IProduct } from '@/models/Product';
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/utils/apiClient';

export default function ProductsPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); // for the input field before enter/debounce
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Variant Deep Filters
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedPurities, setSelectedPurities] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');
    // We didn't build server-side sort, but we can manage basic filters matching the API

    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchProducts = async (currentPage: number, resetObj = false) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams();
            params.append('page', String(currentPage));
            params.append('limit', '12');

            if (categoryFilter !== 'All') params.append('category', categoryFilter);
            if (searchQuery) params.append('search', searchQuery);
            if (selectedSizes.length > 0) params.append('size', selectedSizes.join(','));
            if (selectedPurities.length > 0) params.append('purity', selectedPurities.join(','));
            if (appliedMinPrice) params.append('minPrice', appliedMinPrice);
            if (appliedMaxPrice) params.append('maxPrice', appliedMaxPrice);

            const res = await fetch(getApiUrl(`/api/products?${params.toString()}`));
            const data = await res.json();

            if (data.products) {
                setProducts(prev => resetObj ? data.products : [...prev, ...data.products]);
                setHasMore(data.hasMore);
                setTotalProducts(data.totalCount);
            }
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // When filters change, reset array and fetch page 1
    useEffect(() => {
        setPage(1);
        fetchProducts(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, searchQuery, selectedSizes, selectedPurities, appliedMinPrice, appliedMaxPrice]);

    // When page increments (from infinite scroll), append data
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(searchInput);
    };

    const categoriesList = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles', 'Mangalsutras', 'Pendants', 'Nose Pins', 'Chains', 'Anklets'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8 text-center sm:text-left">
                All Products <span className="text-xl text-gray-500 font-sans font-normal ml-2">({totalProducts} items)</span>
            </h1>

            {/* Filter and Search Bar Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search jewellery (Press Enter)..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow bg-gray-50 hover:bg-white"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </form>

                <div className="flex w-full md:w-auto gap-4 items-center">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                    </button>
                    {/* Category Filter */}
                    <div className="relative min-w-[160px]">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
                        >
                            {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Expandable Advanced Filters */}
            {isFilterOpen && (
                <div className="mb-10 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Purity / Metal</h3>
                        <div className="flex flex-wrap gap-2">
                            {['14K', '18K', '22K', '24K'].map(purity => (
                                <button
                                    key={purity}
                                    onClick={() => setSelectedPurities(prev => prev.includes(purity) ? prev.filter(p => p !== purity) : [...prev, purity])}
                                    className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${selectedPurities.includes(purity) ? 'bg-amber-50 border-amber-600 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'}`}
                                >
                                    {purity}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Size Options</h3>
                        <div className="flex flex-wrap gap-2">
                            {['8', '10', '12', '14', '16', '18', '20', 'S', 'M', 'L'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                                    className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${selectedSizes.includes(size) ? 'bg-amber-50 border-amber-600 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Price Range (INR)</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                            <button
                                onClick={() => { setAppliedMinPrice(minPrice); setAppliedMaxPrice(maxPrice); }}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64 border border-gray-100 rounded-3xl bg-white shadow-sm mt-8">
                    <Loader2 className="animate-spin text-amber-600 w-12 h-12" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xl text-gray-600 font-medium">No jewellery matched your filters.</p>
                    <button
                        onClick={() => {
                            setSearchInput(''); setSearchQuery(''); setCategoryFilter('All');
                            setSelectedSizes([]); setSelectedPurities([]); setMinPrice(''); setMaxPrice(''); setAppliedMinPrice(''); setAppliedMaxPrice('');
                        }}
                        className="mt-4 text-amber-600 hover:underline font-medium"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => {
                            const uniqueKey = `${product._id}-${index}`;
                            if (products.length === index + 1) {
                                return (
                                    <div ref={lastProductElementRef} key={uniqueKey}>
                                        <ProductCard product={product} />
                                    </div>
                                );
                            } else {
                                return <ProductCard key={uniqueKey} product={product} />;
                            }
                        })}
                    </div>

                    {/* Loading Spinner for Infinite Scroll */}
                    {loadingMore && (
                        <div className="flex justify-center items-center py-10 mt-8">
                            <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
                        </div>
                    )}

                    {/* End of list indicator */}
                    {!hasMore && products.length > 0 && (
                        <div className="text-center text-gray-400 py-10 mt-8 border-t border-gray-100">
                            You have viewed all {totalProducts} items.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
