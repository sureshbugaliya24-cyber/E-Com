'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { getApiUrl } from '@/utils/apiClient';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const user = useSelector((state: any) => state.auth.user);

    useEffect(() => {
        if (user) {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                router.push(params.get('redirect') || '/account');
            } else {
                router.push('/account');
            }
        }
    }, [user, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Successfully registered! Send to login
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 mb-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-serif font-bold mb-2 text-center text-gray-900">Create an Account</h2>
            <p className="text-gray-500 mb-8 text-center">Join Radhey Jewellers today.</p>

            {error && <p className="text-red-500 mb-6 text-center text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <form onSubmit={handleRegister} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-amber-500 focus:border-amber-500 py-2.5 px-4 border transition-shadow"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-amber-500 focus:border-amber-500 py-2.5 px-4 border transition-shadow"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-amber-500 focus:border-amber-500 py-2.5 px-4 border transition-shadow"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-amber-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-md mt-4"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <p className="mt-8 text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-amber-600 font-bold hover:underline">
                    Sign in here
                </Link>
            </p>
        </div>
    );
}
