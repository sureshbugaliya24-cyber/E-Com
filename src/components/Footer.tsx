'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-gray-900 pt-16 pb-8 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-2xl font-bold text-amber-500 font-serif block mb-6">
                            Radhey Jewellers
                        </Link>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            {t('footer.description')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 font-serif tracking-widest uppercase text-sm">{t('footer.quickLinks.title')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="hover:text-amber-500 transition-colors">{t('footer.quickLinks.home')}</Link></li>
                            <li><Link href="/products" className="hover:text-amber-500 transition-colors">{t('footer.quickLinks.shopAll')}</Link></li>
                            <li><Link href="/cart" className="hover:text-amber-500 transition-colors">{t('footer.quickLinks.shoppingCart')}</Link></li>
                            <li><Link href="/wishlist" className="hover:text-amber-500 transition-colors">{t('footer.quickLinks.yourWishlist')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 font-serif tracking-widest uppercase text-sm">{t('footer.customerCare.title')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/login" className="hover:text-amber-500 transition-colors">{t('footer.customerCare.myAccount')}</Link></li>
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">{t('footer.customerCare.aboutUs')}</Link></li>
                            <li><Link href="/contact" className="hover:text-amber-500 transition-colors">{t('footer.customerCare.contactUs')}</Link></li>
                            <li><Link href="#" className="hover:text-amber-500 transition-colors">{t('footer.customerCare.shippingReturns')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 font-serif tracking-widest uppercase text-sm">{t('footer.secureShopping.title')}</h4>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            {t('footer.secureShopping.description')}
                        </p>
                        <div className="flex space-x-4">
                            {/* Visual placeholders for trusted payments */}
                            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">VISA</div>
                            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">MC</div>
                            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">RUPAY</div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-amber-500 transition-colors">{t('footer.privacyPolicy')}</Link>
                        <Link href="/terms" className="hover:text-amber-500 transition-colors">{t('footer.termsOfService')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
