import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
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

        const body = await req.json();

        const user = await User.findById(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

        // Add the new address
        user.addresses.push(body);
        await user.save();

        return NextResponse.json({
            message: 'Address added successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses
            }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        await dbConnect();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });

        const user = await User.findById(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

        const address = user.addresses.id(_id);
        if (!address) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

        Object.assign(address, updateData);
        await user.save();

        return NextResponse.json({
            message: 'Address updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses
            }
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const decoded = verifyToken(token) as { id: string } | null;
        if (!decoded) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get('id');

        if (!addressId) return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });

        await dbConnect();
        const user = await User.findById(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

        user.addresses.pull(addressId);
        await user.save();

        return NextResponse.json({
            message: 'Address deleted successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                addresses: user.addresses
            }
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
