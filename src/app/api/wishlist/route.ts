import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wishlist from '@/models/Wishlist';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

        await dbConnect();
        const wishlist = await Wishlist.findOne({ userId: decoded.id }).populate('products');

        return NextResponse.json({ wishlist: wishlist || { products: [] } }, { status: 200 });
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

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: 'Product ID required.' }, { status: 400 });
        }

        await dbConnect();
        let wishlist = await Wishlist.findOne({ userId: decoded.id });

        if (wishlist) {
            const index = wishlist.products.indexOf(productId);
            if (index > -1) {
                // Remove if exists (toggle)
                wishlist.products.splice(index, 1);
            } else {
                wishlist.products.push(productId);
            }
            await wishlist.save();
        } else {
            wishlist = await Wishlist.create({
                userId: decoded.id,
                products: [productId],
            });
        }

        await wishlist.populate('products');

        return NextResponse.json({ wishlist, message: 'Wishlist updated' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
