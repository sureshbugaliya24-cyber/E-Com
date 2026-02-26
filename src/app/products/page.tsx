'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/models/Product';
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';

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

            const res = await fetch(`/api/products?${params.toString()}`);
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
    }, [categoryFilter, searchQuery]);

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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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

                <div className="flex w-full md:w-auto gap-4 items-center overflow-x-auto pb-2 md:pb-0">
                    {/* Category Filter */}
                    <div className="relative min-w-[200px]">
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

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64 border border-gray-100 rounded-3xl bg-white shadow-sm mt-8">
                    <Loader2 className="animate-spin text-amber-600 w-12 h-12" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xl text-gray-600 font-medium">No jewellery matched your filters.</p>
                    <button
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setCategoryFilter('All'); }}
                        className="mt-4 text-amber-600 hover:underline font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, index) => {
                            if (products.length === index + 1) {
                                return (
                                    <div ref={lastProductElementRef} key={String(product._id)}>
                                        <ProductCard product={product} />
                                    </div>
                                );
                            } else {
                                return <ProductCard key={String(product._id)} product={product} />;
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
