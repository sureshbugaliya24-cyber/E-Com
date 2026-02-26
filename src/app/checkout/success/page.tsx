'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-24 h-24 text-green-500" />
                </div>

                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Order Confirmed!</h1>
                <p className="text-gray-600 mb-2 text-lg">Thank you for your purchase.</p>
                <p className="text-gray-500 mb-8">
                    Your luxury order has been received and is currently processing.
                    <br /><br />
                    {orderId && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-mono text-sm border border-gray-200 block mt-2">
                            Tracking ID: {orderId}
                        </span>
                    )}
                </p>

                <div className="flex flex-col space-y-3">
                    <Link
                        href="/products"
                        className="w-full bg-gray-900 hover:bg-amber-600 text-white font-medium py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                        <span>Continue Shopping</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
