import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = (await cookies()).get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                addresses: user.addresses || []
            } 
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
