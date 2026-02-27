import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

const categories = [
    { name: 'Necklaces', count: '10+', image: 'https://images.unsplash.com/photo-1599643478514-4a4e09f52f5e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Rings', count: '10+', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop' },
    { name: 'Earrings', count: '10+', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
    { name: 'Bracelets', count: '10+', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' },
    { name: 'Bangles', count: '10+', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' },
    { name: 'Pendants', count: '10+', image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop' },
    { name: 'Mangalsutras', count: '10+', image: 'https://images.unsplash.com/photo-1584305574647-0cc9ebecfee3?q=80&w=800&auto=format&fit=crop' },
    { name: 'Nose Pins', count: '10+', image: 'https://images.unsplash.com/photo-1602751584552-8ba730ff2f3e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Anklets', count: '10+', image: 'https://images.unsplash.com/photo-1543294001-f76eadcff8ba?q=80&w=800&auto=format&fit=crop' },
    { name: 'Chains', count: '10+', image: 'https://images.unsplash.com/photo-1573408301145-b98c642231ab?q=80&w=800&auto=format&fit=crop' }
];

export default function CategoriesIndexPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Breadcrumbs items={[{ label: 'Categories' }]} />
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 border-b-2 border-amber-600 inline-block pb-2">Shop by Category</h1>
            <p className="text-gray-600 mb-12 max-w-2xl text-lg">Browse our expansive inventory categorized explicitly for an effortless shopping experience.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {categories.map(cat => (
                    <Link key={cat.name} href={`/categories/${cat.name.toLowerCase()}`} className="group flex flex-col items-center">
                        <div className="w-full aspect-square rounded-full overflow-hidden mb-4 shadow-sm border-2 border-transparent group-hover:border-amber-600 transition-colors p-1">
                            <div
                                className="w-full h-full rounded-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                                style={{ backgroundImage: `url(${cat.image})` }}
                            />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-center">{cat.name}</h3>
                        <p className="text-sm text-gray-500">{cat.count} Products</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
