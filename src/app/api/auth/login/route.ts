import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/utils/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
        }

        const token = generateToken({ id: user._id, role: user.role });

        const response = NextResponse.json(
            { 
                message: 'Logged in successfully.', 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role,
                    addresses: user.addresses || []
                } 
            },
            { status: 200 }
        );

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
