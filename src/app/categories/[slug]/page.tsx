import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/mongoose';
import Product, { IProduct } from '@/models/Product';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getCategoryProducts(slug: string) {
    try {
        await dbConnect();

        // Format slug properly for Case-Sensitive DB Matching (e.g. 'nose-pins' -> 'Nose Pins')
        const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        const products = await Product.find({ category: categoryName }).lean();
        return { products: JSON.parse(JSON.stringify(products)), categoryName };
    } catch (error) {
        console.error('Failed to fetch category', error);
        return { products: [], categoryName: slug };
    }
}

export default async function SingleCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { products, categoryName } = await getCategoryProducts(resolvedParams.slug);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <Link href="/categories" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Categories
            </Link>

            <header className="mb-12 border-b border-gray-100 pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 mb-4">{categoryName}</h1>
                <p className="text-xl text-gray-500 max-w-2xl">Browse our complete inventory of {products.length} stunning {categoryName.toLowerCase()}.</p>
            </header>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">Category Empty</h3>
                    <p className="text-gray-500">No pieces found in this category currently.</p>
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
