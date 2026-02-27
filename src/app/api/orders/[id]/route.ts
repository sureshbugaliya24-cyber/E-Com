import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        await dbConnect();

        const { id } = await params;
        const order = await Order.findOne({ _id: id, user: decoded.id });

        if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

        return NextResponse.json({ order }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
