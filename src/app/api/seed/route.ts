import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import mongoose from 'mongoose';

const collectionsList = ['Bridal', 'Heritage', 'Modern', 'Temple', 'Mens', 'Everyday', 'Royal', 'Minimalist', 'Festive', 'Antique'];
const categoriesList = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles', 'Mangalsutras', 'Pendants', 'Nose Pins', 'Chains', 'Anklets'];

const purities = ['14K', '18K', '22K', '24K'];
const ringSizes = ['8', '10', '12', '14'];
const bangleSizes = ['2.4', '2.6', '2.8'];
const generalSizes = ['S', 'M', 'L'];

function generateProducts() {
    const products: any[] = [];
    let idCounter = 1;

    categoriesList.forEach((cat) => {
        // Generate exactly 10 products per category
        for (let i = 0; i < 10; i++) {
            // Evenly distribute collections so each collection gets 10 products total (10 cats * 10 prods / 10 cols)
            const collectionIndex = (categoriesList.indexOf(cat) + i) % collectionsList.length;
            const collection = collectionsList[collectionIndex];

            const baseName = `${collection} ${cat} ${i + 1}`;
            const slug = `${collection.toLowerCase()}-${cat.toLowerCase().replace(' ', '-')}-${i + 1}`;

            // Generate pseudo-random variations logic based on Category
            let options: any[] = [];
            let variations: any[] = [];
            const basePrice = Math.floor(Math.random() * 50000) + 10000;

            if (cat === 'Rings') {
                options = [
                    { name: 'Purity', values: ['18K', '22K'] },
                    { name: 'Size', values: ringSizes }
                ];
                ['18K', '22K'].forEach(p => {
                    ringSizes.forEach(s => {
                        variations.push({
                            sku: `RNG-${p}-${s}-${idCounter}`,
                            name: `${p} Gold - Size ${s}`,
                            priceINR: basePrice + (p === '22K' ? 15000 : 0) + (parseInt(s) * 500),
                            stock: Math.floor(Math.random() * 5),
                            attributes: { Purity: p, Size: s }
                        });
                    });
                });
            } else if (cat === 'Bangles' || cat === 'Bracelets') {
                options = [
                    { name: 'Purity', values: ['22K', '24K'] },
                    { name: 'Size', values: bangleSizes }
                ];
                ['22K', '24K'].forEach(p => {
                    bangleSizes.forEach(s => {
                        variations.push({
                            sku: `BNGL-${p}-${s.replace('.', '')}-${idCounter}`,
                            name: `${p} Gold - Size ${s}`,
                            priceINR: basePrice + (p === '24K' ? 30000 : 0) + (parseFloat(s) * 2000),
                            stock: Math.floor(Math.random() * 5),
                            attributes: { Purity: p, Size: s }
                        });
                    });
                });
            } else {
                options = [
                    { name: 'Purity', values: purities.slice(1, 3) }, // 18K, 22K
                    { name: 'Size', values: generalSizes }
                ];
                purities.slice(1, 3).forEach(p => {
                    generalSizes.forEach(s => {
                        variations.push({
                            sku: `${cat.substring(0, 3).toUpperCase()}-${p}-${s}-${idCounter}`,
                            name: `${p} Gold - Size ${s}`,
                            priceINR: basePrice + (p === '22K' ? 20000 : 0) + (s === 'L' ? 5000 : 0),
                            stock: Math.floor(Math.random() * 5),
                            attributes: { Purity: p, Size: s }
                        });
                    });
                });
            }

            products.push({
                name: { en: baseName, hi: `${baseName} (Hindi)` },
                slug: slug,
                description: { en: `Beautiful ${baseName} crafted for elegance.`, hi: "सुंदर आभूषण।" },
                basePriceINR: basePrice,
                category: cat,
                collections: [collection],
                collectionName: collection,
                images: [
                    "https://images.unsplash.com/photo-1599643478514-4a52023924bf?w=500&q=80",
                    "https://images.unsplash.com/photo-1605100804763-247f66126e28?w=500&q=80"
                ],
                isFeatured: i === 0, // feature 1st item of every category
                stock: 10,
                options: options,
                variations: variations
            });

            idCounter++;
        }
    });

    return products;
}

export async function GET() {
    try {
        await dbConnect();

        // Wipe all existing products to recreate properly
        await Product.deleteMany({});

        const dynamicProducts = generateProducts();

        // Debug diagnostic instantiation
        const testDoc = new Product(dynamicProducts[0]);
        const validationError = testDoc.validateSync();

        // Insert fresh ones
        const saved = await Product.insertMany(dynamicProducts);

        return NextResponse.json({
            message: `Successfully seeded ${saved.length} multi-variant products!`,
            breakdown: "10 products per 10 categories",
            diagnosticDoc: testDoc.toJSON(),
            diagnosticError: validationError ? validationError.message : "Success"
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
