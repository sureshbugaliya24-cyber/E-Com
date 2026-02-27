import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { verifyToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const url = new URL(req.url);
        const category = url.searchParams.get('category');
        const isFeatured = url.searchParams.get('isFeatured');
        const search = url.searchParams.get('search');
        const ids = url.searchParams.get('ids');
        const size = url.searchParams.get('size');
        const purity = url.searchParams.get('purity');
        const minPrice = url.searchParams.get('minPrice');
        const maxPrice = url.searchParams.get('maxPrice');

        if (ids) {
            const idsArray = ids.split(',');
            const products = await Product.find({ _id: { $in: idsArray } });
            return NextResponse.json({ products }, { status: 200 });
        }

        // Pagination logic
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        const query: any = {};
        const andConditions: any[] = [];

        if (category) query.category = category;
        if (isFeatured === 'true') query.isFeatured = true;

        if (search) {
            andConditions.push({
                $or: [
                    { 'name.en': { $regex: search, $options: 'i' } },
                    { 'description.en': { $regex: search, $options: 'i' } }
                ]
            });
        }

        const variationMatch: any = {};
        let hasVariationFilters = false;

        const variationQueries: any[] = [];

        if (size) {
            const sizes = size.split(',');
            variationQueries.push({ 'attributes.Size': { $in: sizes } });
            hasVariationFilters = true;
        }
        if (purity) {
            const purities = purity.split(',');
            variationQueries.push({ 'attributes.Purity': { $in: purities } });
            hasVariationFilters = true;
        }

        if (variationQueries.length > 0) {
            variationMatch.$and = variationQueries;
        }

        if (minPrice || maxPrice) {
            const priceQ: any = {};
            if (minPrice) priceQ.$gte = Number(minPrice);
            if (maxPrice) priceQ.$lte = Number(maxPrice);

            if (hasVariationFilters) {
                variationMatch.priceINR = priceQ;
                andConditions.push({ variations: { $elemMatch: variationMatch } });
            } else {
                andConditions.push({
                    $or: [
                        { basePriceINR: priceQ },
                        { variations: { $elemMatch: { priceINR: priceQ } } }
                    ]
                });
            }
        } else if (hasVariationFilters) {
            andConditions.push({ variations: { $elemMatch: variationMatch } });
        }

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const totalCount = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Lean for faster performance with Maps

        const hasMore = totalCount > skip + products.length;

        return NextResponse.json({ products, hasMore, totalCount }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized as admin.' }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json();

        const newProduct = await Product.create(body);
        return NextResponse.json({ product: newProduct, message: 'Product created successfully.' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
