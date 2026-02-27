import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';
import Cart from '@/models/Cart';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';

// When a user logs in, they send their local Redux cart and wishlist items
export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

        await dbConnect();

        const { cartItems = [], wishlistItems = [] } = await req.json();

        // --- Handle Cart Sync ---
        let cart = await Cart.findOne({ userId: decoded.id });
        if (!cart) {
            cart = new Cart({ userId: decoded.id, items: [] });
        }

        for (const item of cartItems) {
            const productExists = await Product.exists({ _id: item.productId });
            if (!productExists) continue;

            const existingIndex = cart.items.findIndex((p: any) => p.productId.toString() === item.productId && p.variationName === item.variationName);
            if (existingIndex > -1) {
                cart.items[existingIndex].quantity += item.quantity;
            } else {
                cart.items.push({ productId: item.productId, quantity: item.quantity, variationName: item.variationName });
            }
        }
        await cart.save();

        // --- Handle Wishlist Sync ---
        let wishlist = await Wishlist.findOne({ userId: decoded.id });
        if (!wishlist) {
            wishlist = new Wishlist({ userId: decoded.id, products: [] });
        }

        for (const productId of wishlistItems) {
            const productExists = await Product.exists({ _id: productId });
            if (!productExists) continue;

            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
            }
        }
        await wishlist.save();

        // --- Fetch and Return Unified State ---
        await cart.populate('items.productId');
        const validCartItems = cart.items.filter((item: any) => item.productId !== null);

        if (validCartItems.length !== cart.items.length) {
            cart.items = validCartItems;
            await cart.save();
        }

        const unifiedWishlistRaw = wishlist.products;

        const unifiedCart = validCartItems.map((c: any) => ({
            productId: typeof c.productId === 'object' ? String(c.productId._id) : String(c.productId),
            quantity: c.quantity,
            variationName: c.variationName
        }));
        const unifiedWishlist = unifiedWishlistRaw.map((w: any) => String(w));

        return NextResponse.json({
            message: 'Sync successful',
            cart: unifiedCart,
            wishlist: unifiedWishlist
        }, { status: 200 });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
