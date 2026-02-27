'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { getApiUrl } from '@/utils/apiClient';
import Link from 'next/link';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const timeline = (() => {
        if (!order?.trackingTimeline) return [];
        const t = [...order.trackingTimeline];
        if (!t.some(s => s.status.toLowerCase() === 'return')) {
            const lastDate = t.length > 0 && t[t.length - 1]?.date ? new Date(t[t.length - 1].date) : new Date();
            const retDate = new Date(lastDate);
            retDate.setDate(retDate.getDate() + 1);
            t.push({ status: 'Return', date: retDate, description: '', isCompleted: false });
        }
        return t;
    })();

    const handleDownloadInvoice = () => {
        if (!order) return;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Radhey Jewellers - Invoice", 14, 22);

        doc.setFontSize(12);
        doc.text(`Order ID: #${order._id.substring(order._id.length - 8).toUpperCase()}`, 14, 32);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);
        doc.text(`Payment Status: ${order.paymentStatus}`, 14, 44);

        doc.text("Shipping Address:", 14, 54);
        doc.setFontSize(10);
        doc.text(`${order.shippingAddress.fullName}`, 14, 60);
        doc.text(`${order.shippingAddress.street}`, 14, 65);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 14, 70);

        const tableColumn = ["Item Name", "Variation", "Quantity", "Price"];
        const tableRows: any[] = [];

        order.items.forEach((item: any) => {
            const itemData = [
                item.name,
                item.variationName || "-",
                item.quantity,
                `Rs. ${item.price.toLocaleString('en-IN')}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            startY: 80,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 80;
        doc.setFontSize(12);
        doc.text(`Total Amount: Rs. ${order.totalAmountINR.toLocaleString('en-IN')}`, 14, finalY + 10);

        doc.save(`Invoice_${order._id.substring(order._id.length - 8).toUpperCase()}.pdf`);
    };

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
                    <button onClick={handleDownloadInvoice} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
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
                                {timeline.map((step: any, idx: number) => {
                                    const isCompleted = step.isCompleted;
                                    const nextStep = timeline[idx + 1];
                                    const isActive = isCompleted && (!nextStep || !nextStep.isCompleted);
                                    const isPastCompleted = isCompleted && !isActive;
                                    const isReturnNode = step.status === 'Return';

                                    return (
                                        <div key={idx} className="flex gap-6">
                                            <div className="relative flex flex-col items-center w-8">
                                                <div className={`relative z-10 flex items-center justify-center shrink-0 bg-gray-50
                                                    ${isReturnNode ? 'w-6 h-6 rounded-lg bg-gray-300 mt-1' : ''}
                                                    ${isPastCompleted && !isReturnNode ? 'w-6 h-6 rounded-full border-[4px] border-green-700 mt-1 bg-white' : ''}
                                                    ${isActive && !isReturnNode ? 'w-7 h-7 rounded-full border-[4px] border-gray-400 shadow-sm mt-0.5 bg-white' : ''}
                                                    ${!isCompleted && !isReturnNode ? 'w-5 h-5 rounded-lg bg-gray-300 mt-1.5' : ''}
                                                `}>
                                                    {isActive && !isReturnNode && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                                                </div>

                                                {/* Connect line highlight */}
                                                {idx !== timeline.length - 1 && (
                                                    <div className={`w-[3px] flex-1 my-1.5 rounded-full ${isPastCompleted ? 'bg-green-700' : 'bg-gray-200'}`}></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-10 -mt-1">
                                                <h3 className={`font-bold text-base tracking-wide ${isCompleted ? 'text-gray-900' : 'text-gray-800'}`}>{step.status}</h3>
                                                {step.date && <p className="text-[13px] mt-0.5 text-gray-500 font-medium">
                                                    {new Date(step.date).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit' })}
                                                </p>}
                                                {step.description && !step.date && <p className="text-[13px] mt-0.5 text-gray-400">{step.description}</p>}
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
