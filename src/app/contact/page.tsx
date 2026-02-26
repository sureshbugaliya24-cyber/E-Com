'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
    const language = useSelector((state: any) => state.ui.language);
    const dict = language === 'hi' ? hi : en;

    useEffect(() => {
        document.title = `${dict.contact.title} | Radhey Jewellers`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", dict.contact.metaDescription);
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = dict.contact.metaDescription;
            document.head.appendChild(meta);
        }
    }, [dict]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-12 text-center border-b border-gray-200 pb-8">
                {dict.contact.title}
            </h1>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-12">
                <h2 className="text-2xl font-bold text-amber-600 mb-8">{dict.contact.heading}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <MapPin className="w-10 h-10 text-gray-900 mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">{dict.contact.addressLabel}</h3>
                        <p className="text-gray-600">{dict.contact.address}</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <Mail className="w-10 h-10 text-gray-900 mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">{dict.contact.emailLabel}</h3>
                        <p className="text-gray-600">{dict.contact.email}</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <Phone className="w-10 h-10 text-gray-900 mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">{dict.contact.phoneLabel}</h3>
                        <p className="text-gray-600">{dict.contact.phone}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
