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
