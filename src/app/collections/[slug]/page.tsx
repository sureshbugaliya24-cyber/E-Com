import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import dbConnect from '@/lib/mongoose';
import Product, { IProduct } from '@/models/Product';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getCollectionProducts(slug: string) {
    try {
        await dbConnect();
        // Capitalize slug for DB match (e.g., 'bridal' -> 'Bridal')
        const collectionName = slug.charAt(0).toUpperCase() + slug.slice(1);
        const products = await Product.find({ collectionName }).lean();
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error('Failed to fetch collection', error);
        return [];
    }
}

export default async function SingleCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const products = await getCollectionProducts(resolvedParams.slug);
    const collectionName = resolvedParams.slug.charAt(0).toUpperCase() + resolvedParams.slug.slice(1);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <Breadcrumbs items={[
                { label: 'Collections', href: '/collections' },
                { label: collectionName }
            ]} />

            <header className="mb-12 border-b border-gray-100 pb-8 mt-6">
                <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 mb-4">{collectionName} Collection</h1>
                <p className="text-xl text-gray-500 max-w-2xl">Discover {products.length} exclusive pieces curated perfectly for the {collectionName} aesthetic.</p>
            </header>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">Collection Empty</h3>
                    <p className="text-gray-500">No products found in this collection currently.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product: IProduct) => (
                        <ProductCard key={String(product._id)} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
