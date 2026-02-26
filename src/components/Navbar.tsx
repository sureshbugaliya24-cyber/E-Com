'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const collectionsList = ['Bridal', 'Heritage', 'Modern', 'Temple', 'Mens', 'Everyday', 'Royal', 'Minimalist', 'Festive', 'Antique'];
const categoriesList = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles', 'Pendants', 'Mangalsutras', 'Nose Pins', 'Anklets', 'Chains'];

export default function Navbar() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.cart.items);
    const wishlistItems = useSelector((state: any) => state.wishlist.items);
    const { t } = useTranslation();

    // Fix hydration mismatch for counts
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const LanguageSelector = () => (
        <select
            value={useSelector((state: RootState) => state.ui.language)}
            onChange={(e) => dispatch({ type: 'ui/setLanguage', payload: e.target.value })}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer hover:text-amber-600 transition-colors"
        >
            <option value="en">EN</option>
            <option value="hi">HI</option>
        </select>
    );

    const CurrencySelector = () => (
        <select
            value={useSelector((state: RootState) => state.ui.currency)}
            onChange={(e) => dispatch({ type: 'ui/setCurrency', payload: e.target.value })}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer hover:text-amber-600 transition-colors"
        >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
        </select>
    );

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo - Left */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold text-amber-600 font-serif">
                            Radhey Jewellers
                        </Link>
                    </div>

                    {/* Desktop Center Links with Dropdowns */}
                    <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2 h-full">
                        <Link href="/" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">{t('navbar.home')}</Link>
                        <Link href="/products" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">{t('navbar.shopAll')}</Link>
                        <Link href="/about" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">{t('navbar.aboutUs')}</Link>
                        <Link href="/contact" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">{t('navbar.contact')}</Link>

                        {/* Collections Dropdown */}
                        <div
                            className="relative flex items-center h-full"
                            onMouseEnter={() => setActiveDropdown('collections')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link href="/collections" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">
                                {t('navbar.collections')} <ChevronDown className="w-4 h-4 ml-1" />
                            </Link>
                            {activeDropdown === 'collections' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-50">
                                    {collectionsList.map(col => (
                                        <Link key={col} href={`/collections/${col.toLowerCase()}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                                            {col}
                                        </Link>
                                    ))}
                                    <div className="border-t border-gray-100 my-1 pt-1">
                                        <Link href="/collections" className="block px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50">{t('navbar.viewAllCollections')}</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Categories Dropdown */}
                        <div
                            className="relative flex items-center h-full"
                            onMouseEnter={() => setActiveDropdown('categories')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link href="/categories" className="flex items-center text-gray-700 hover:text-amber-600 font-medium transition-colors h-full">
                                {t('navbar.categories')} <ChevronDown className="w-4 h-4 ml-1" />
                            </Link>
                            {activeDropdown === 'categories' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-50">
                                    {categoriesList.map(cat => (
                                        <Link key={cat} href={`/categories/${cat.toLowerCase().replace(' ', '-')}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                                            {cat}
                                        </Link>
                                    ))}
                                    <div className="border-t border-gray-100 my-1 pt-1">
                                        <Link href="/categories" className="block px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50">{t('navbar.viewAllCategories')}</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Right Nav (Icons + Language/Currency) */}
                    <div className="hidden md:flex items-center space-x-6">
                        <LanguageSelector />
                        <CurrencySelector />

                        <Link href="/wishlist" className="text-gray-600 hover:text-amber-600 relative transition-colors flex items-center h-full">
                            <Heart className="w-5 h-5" />
                            {isMounted && wishlistCount > 0 && (
                                <span className="absolute top-[-8px] -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center shadow-sm">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/cart" className="text-gray-600 hover:text-amber-600 relative transition-colors flex items-center h-full">
                            <ShoppingCart className="w-5 h-5" />
                            {isMounted && cartCount > 0 && (
                                <span className="absolute top-[-8px] -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/login" className="text-gray-600 hover:text-amber-600 transition-colors flex items-center h-full">
                            <User className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Mobile Hamburger Icon (Right) */}
                    <div className="flex md:hidden items-center">
                        <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-amber-600 focus:outline-none p-1">
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg top-16 left-0 w-full absolute py-4 px-6 space-y-2 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto pb-12">
                    {/* Primary Links */}
                    <Link href="/" onClick={toggleMobileMenu} className="block text-gray-700 py-3 border-b border-gray-100 font-medium">{t('navbar.home')}</Link>
                    <Link href="/products" onClick={toggleMobileMenu} className="block text-gray-700 py-3 border-b border-gray-100 font-medium">{t('navbar.shopAll')}</Link>
                    <Link href="/about" onClick={toggleMobileMenu} className="block text-gray-700 py-3 border-b border-gray-100 font-medium">{t('navbar.aboutUs')}</Link>
                    <Link href="/contact" onClick={toggleMobileMenu} className="block text-gray-700 py-3 border-b border-gray-100 font-medium">{t('navbar.contact')}</Link>

                    <div className="py-3 border-b border-gray-100">
                        <div className="font-medium text-amber-600 mb-2">{t('navbar.collections')}</div>
                        <div className="grid grid-cols-2 gap-2 pl-4">
                            {collectionsList.map(col => (
                                <Link key={col} href={`/collections/${col.toLowerCase()}`} onClick={toggleMobileMenu} className="text-sm text-gray-600 py-1 hover:text-amber-600">{col}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="py-3 border-b border-gray-100">
                        <div className="font-medium text-amber-600 mb-2">{t('navbar.categories')}</div>
                        <div className="grid grid-cols-2 gap-2 pl-4">
                            {categoriesList.map(cat => (
                                <Link key={cat} href={`/categories/${cat.toLowerCase().replace(' ', '-')}`} onClick={toggleMobileMenu} className="text-sm text-gray-600 py-1 hover:text-amber-600">{cat}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Settings / Actions */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4 pt-4">
                        <span className="text-sm font-medium text-gray-700">{t('navbar.language')}</span>
                        <LanguageSelector />
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4 pt-4">
                        <span className="text-sm font-medium text-gray-700">{t('navbar.currency')}</span>
                        <CurrencySelector />
                    </div>

                    <Link href="/wishlist" onClick={toggleMobileMenu} className="flex items-center justify-between text-gray-700 py-3 border-b border-gray-100">
                        <span className="font-medium">{t('navbar.wishlist')}</span>
                        <div className="flex items-center space-x-2">
                            {isMounted && wishlistCount > 0 && <span className="text-rose-500 font-bold text-sm bg-rose-50 px-2 rounded-full">{wishlistCount}</span>}
                            <Heart className="w-5 h-5 text-gray-500" />
                        </div>
                    </Link>
                    <Link href="/cart" onClick={toggleMobileMenu} className="flex items-center justify-between text-gray-700 py-3 border-b border-gray-100">
                        <span className="font-medium">{t('navbar.cart')}</span>
                        <div className="flex items-center space-x-2">
                            {isMounted && cartCount > 0 && <span className="text-red-500 font-bold text-sm bg-red-50 px-2 rounded-full">{cartCount}</span>}
                            <ShoppingCart className="w-5 h-5 text-gray-500" />
                        </div>
                    </Link>
                    <Link href="/login" onClick={toggleMobileMenu} className="flex items-center justify-between text-gray-700 py-3 pt-4 mb-4">
                        <span className="font-medium">{t('navbar.myAccount')}</span>
                        <User className="w-5 h-5 text-gray-500" />
                    </Link>
                </div>
            )}
        </nav>
    );
}
