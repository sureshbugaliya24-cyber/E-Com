import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import User from '@/models/User';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        await dbConnect();

        const { addressId, currency = 'INR' } = await req.json();

        // Validate User and Address
        const user = await User.findById(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

        const shippingAddress = user.addresses.id(addressId);
        if (!shippingAddress) return NextResponse.json({ error: 'Shipping address not found.' }, { status: 400 });

        // Get Cart Items
        const cartItems = await Cart.find({ user: decoded.id }).populate('product');
        if (cartItems.length === 0) return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });

        let totalAmountINR = 0;
        const orderItems = cartItems.map(item => {
            const product = item.product as any;
            totalAmountINR += (product.basePriceINR * item.quantity);

            return {
                product: product._id,
                quantity: item.quantity,
                price: product.basePriceINR,
                name: product.name.en || product.name
            };
        });

        // Create Order
        const newOrder = await Order.create({
            user: decoded.id,
            items: orderItems,
            shippingAddress,
            totalAmountINR,
            currencyAtPurchase: currency,
            paymentStatus: 'Pending', // Assuming Cash On Delivery for now
            orderStatus: 'Processing'
        });

        // Empty the DB Cart
        await Cart.deleteMany({ user: decoded.id });

        return NextResponse.json({ message: 'Order placed successfully.', order: newOrder }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
