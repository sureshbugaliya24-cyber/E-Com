'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { getApiUrl } from '@/utils/apiClient';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(getApiUrl(`/api/orders/${params.id}`));
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data.order);
                } else {
                    console.error('Failed to load order');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchOrder();
    }, [params.id]);

    if (loading) return <div className="min-h-screen pt-32 text-center text-xl text-gray-500">Loading Order Details...</div>;

    if (!order) return (
        <div className="min-h-screen pt-32 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <Link href="/account" className="text-amber-600 hover:underline">Return to Account</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50">
            <Link href="/account" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Orders
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
                        <p className="text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-not-allowed opacity-50">
                        <Download className="w-4 h-4 mr-2" /> Download Invoice
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {/* Tracking Timeline */}
                    <div className="mb-12">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Tracking</h2>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            <div className="space-y-8 relative">
                                {order.trackingTimeline && order.trackingTimeline.map((step: any, idx: number) => {
                                    const isCompleted = step.isCompleted;
                                    return (
                                        <div key={idx} className="flex gap-4">
                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 ${isCompleted ? 'border-amber-500' : 'border-gray-200'}`}>
                                                {isCompleted ? <CheckCircle className="w-5 h-5 text-amber-500" /> : <Clock className="w-4 h-4 text-gray-300" />}
                                                {/* Connect line highlight */}
                                                {isCompleted && idx !== order.trackingTimeline.length - 1 && (
                                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-amber-500"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <h3 className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                                                {isCompleted && <p className="text-xs text-gray-400 mt-1">{new Date(step.date).toLocaleString()}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pt-8 border-t border-gray-100">
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4">Shipping Address</h2>
                            <div className="text-gray-900 space-y-1">
                                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4">Payment Info</h2>
                            <div className="text-gray-900 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment Status:</span>
                                    <span className="font-semibold">{order.paymentStatus}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Currency:</span>
                                    <span className="font-semibold">{order.currencyAtPurchase}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4">Items</h2>
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100 flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 m-auto text-gray-300 absolute inset-0" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            {item.variationName && <p className="text-sm text-gray-500">Variation: {item.variationName}</p>}
                                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        {item.quantity > 1 && <p className="text-xs text-gray-500 text-right">₹{item.price.toLocaleString('en-IN')} each</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                        <div className="w-full sm:w-1/2 space-y-3">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{order.totalAmountINR.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-gray-100 font-bold text-xl text-gray-900">
                                <span>Total</span>
                                <span>₹{order.totalAmountINR.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
