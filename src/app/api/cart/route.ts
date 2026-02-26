import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Cart from '@/models/Cart';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

        await dbConnect();
        // Populate product details specifically without translating fields in db cart query
        const cart = await Cart.findOne({ userId: decoded.id }).populate('items.productId');

        return NextResponse.json({ cart: cart || { items: [] } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

        const { productId, quantity } = await req.json();
        if (!productId || quantity == null || quantity < 1) {
            return NextResponse.json({ error: 'Valid product layout and quantity required.' }, { status: 400 });
        }

        await dbConnect();
        let cart = await Cart.findOne({ userId: decoded.id });

        if (cart) {
            const itemIndex = cart.items.findIndex((p: any) => p.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
            cart = await cart.save();
        } else {
            cart = await Cart.create({
                userId: decoded.id,
                items: [{ productId, quantity }],
            });
        }

        // Populate after saving to return updated view
        await cart.populate('items.productId');

        return NextResponse.json({ cart, message: 'Added to cart' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // updates specific cart item quantity
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

        const { productId, quantity } = await req.json();
        if (!productId || quantity == null || quantity < 0) {
            return NextResponse.json({ error: 'Valid product and quantity required.' }, { status: 400 });
        }

        await dbConnect();
        const cart = await Cart.findOne({ userId: decoded.id });

        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

        const itemIndex = cart.items.findIndex((p: any) => p.productId.toString() === productId);

        if (itemIndex > -1) {
            if (quantity === 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            await cart.populate('items.productId');
            return NextResponse.json({ cart }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
