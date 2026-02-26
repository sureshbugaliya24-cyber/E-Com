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
        const cart = await Cart.findOne({ userId: decoded.id }).populate('items.productId');
        if (!cart) return NextResponse.json({ error: 'Cart not found for this user.' }, { status: 400 });
        if (cart.items.length === 0) return NextResponse.json({ error: 'Your cart is empty in the database.' }, { status: 400 });

        let totalAmountINR = 0;
        const orderItems = cart.items.map((item: any) => {
            const product = item.productId;
            if (!product) return null;
            
            totalAmountINR += (product.basePriceINR * item.quantity);

            // Extract string from bilingual name object
            const productName = typeof product.name === 'object' && product.name !== null
                ? product.name.en || 'Jewellery Item'
                : product.name || 'Jewellery Item';

            return {
                product: product._id,
                quantity: item.quantity,
                price: product.basePriceINR,
                name: String(productName)
            };
        }).filter((i: any) => i !== null);

        if (orderItems.length === 0) return NextResponse.json({ error: 'No valid items in cart.' }, { status: 400 });

        // Create Order
        const newOrder = await Order.create({
            user: decoded.id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country,
                phone: shippingAddress.phone
            },
            totalAmountINR,
            currencyAtPurchase: currency,
            paymentStatus: 'Pending', // Assuming Cash On Delivery for now
            orderStatus: 'Processing'
        });

        // Empty the DB Cart
        cart.items = [];
        await cart.save();

        return NextResponse.json({ message: 'Order placed successfully.', order: newOrder }, { status: 201 });
    } catch (error: any) {
        console.error("ORDER CREATION FAILED STRICT LOG:");
        console.error(error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        await dbConnect();

        // Get orders for the user, sort by newest first
        const orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 });
        return NextResponse.json({ orders }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
