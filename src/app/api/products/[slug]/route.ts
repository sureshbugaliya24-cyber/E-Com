import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;
        const product = await Product.findOne({ slug });

        if (!product) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ product }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized as admin.' }, { status: 403 });
        }

        await dbConnect();
        const { slug } = await params;
        const body = await req.json();

        const updatedProduct = await Product.findOneAndUpdate({ slug }, body, { new: true });

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ product: updatedProduct, message: 'Product updated successfully.' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized as admin.' }, { status: 403 });
        }

        await dbConnect();
        const { slug } = await params;
        const deletedProduct = await Product.findOneAndDelete({ slug });

        if (!deletedProduct) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
