'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

export default function TermsPage() {
    const language = useSelector((state: any) => state.ui.language);
    const dict = language === 'hi' ? hi : en;

    useEffect(() => {
        document.title = `${dict.terms.title} | Radhey Jewellers`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", dict.terms.metaDescription);
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = dict.terms.metaDescription;
            document.head.appendChild(meta);
        }
    }, [dict]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-12 text-center border-b border-gray-200 pb-8">
                {dict.terms.title}
            </h1>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-amber-600 mb-4">{dict.terms.heading}</h2>
                    <p className="text-gray-700 leading-relaxed">{dict.terms.content1}</p>
                </div>
                <div>
                    <p className="text-gray-700 leading-relaxed">{dict.terms.content2}</p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <div className="inline-block w-24 h-1 bg-amber-600 rounded-full"></div>
            </div>
        </div>
    );
}
