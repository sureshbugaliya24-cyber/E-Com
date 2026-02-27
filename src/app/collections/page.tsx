import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

const collections = [
    { name: 'Bridal', description: 'Exquisite heavy sets for your special day.', image: 'https://images.unsplash.com/photo-1599643478514-4a4e09f52f5e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Heritage', description: 'Timeless pieces passed down through generations.', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' },
    { name: 'Modern', description: 'Sleek, contemporary designs for the modern woman.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' },
    { name: 'Temple', description: 'Divine jewellery inspired by ancient Indian temples.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
    { name: 'Mens', description: 'Bold and sophisticated accessories for men.', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop' },
    { name: 'Everyday', description: 'Lightweight pieces perfect for daily wear.', image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop' },
    { name: 'Royal', description: 'Regal adornments fit for true royalty.', image: 'https://images.unsplash.com/photo-1584305574647-0cc9ebecfee3?q=80&w=800&auto=format&fit=crop' },
    { name: 'Minimalist', description: 'Understated elegance in clean, simple lines.', image: 'https://images.unsplash.com/photo-1602751584552-8ba730ff2f3e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Festive', description: 'Vibrant jewellery to celebrate joyous occasions.', image: 'https://images.unsplash.com/photo-1543294001-f76eadcff8ba?q=80&w=800&auto=format&fit=crop' },
    { name: 'Antique', description: 'Vintage-inspired designs with historical charm.', image: 'https://images.unsplash.com/photo-1573408301145-b98c642231ab?q=80&w=800&auto=format&fit=crop' }
];

export default function CollectionsIndexPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Breadcrumbs items={[{ label: 'Collections' }]} />
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 border-b-2 border-amber-600 inline-block pb-2">Our Curated Collections</h1>
            <p className="text-gray-600 mb-12 max-w-2xl text-lg">Explore our ten beautifully curated master collections representing the pinnacle of artisanal luxury.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map(col => (
                    <Link key={col.name} href={`/collections/${col.name.toLowerCase()}`} className="group block relative h-80 rounded-2xl overflow-hidden shadow-md">
                        <div
                            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: `url(${col.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-8 text-white">
                            <h2 className="text-3xl font-serif font-bold mb-2 group-hover:text-amber-500 transition-colors">{col.name}</h2>
                            <p className="text-gray-200 text-sm">{col.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
