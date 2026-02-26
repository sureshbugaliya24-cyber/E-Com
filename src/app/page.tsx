import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/models/Product';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Link from 'next/link';

// Fetch directly from server action / DB in Next.js App Router for Server Components
async function getFeaturedProducts() {
  try {
    await dbConnect();
    // Just pull 8 random or featured latest products for the homepage
    const products = await Product.find({ isFeatured: true }).limit(8).lean();
    return JSON.parse(JSON.stringify(products)); // Serialize for client components
  } catch (error) {
    console.error('Failed to fetch products', error);
    return [];
  }
}

const categories = [
  { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478514-4a4e09f52f5e?q=80&w=400&auto=format&fit=crop' },
  { name: 'Rings', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop' },
  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop' },
  { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop' },
  { name: 'Bangles', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop' },
];

const collections = [
  { name: 'Bridal', image: 'https://images.unsplash.com/photo-1599643478514-4a4e09f52f5e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Temple', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
];

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 font-serif drop-shadow-lg">
            Elegance Crafted for You
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 drop-shadow-md">
            Discover our exclusive luxury collection of fine jewellery celebrating your unique style.
          </p>
          <Link href="/products" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full text-lg font-medium transition-all shadow-xl hover:shadow-amber-600/50 hover:-translate-y-1 inline-block">
            Shop the Master Collection
          </Link>
        </div>
      </section>

      {/* Shop by Category (Circular Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 tracking-tight">Shop By Category</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/categories/${cat.name.toLowerCase()}`} className="group flex flex-col items-center">
              <div className="w-full aspect-square rounded-full overflow-hidden mb-4 shadow-md border-4 border-transparent group-hover:border-amber-600 transition-colors">
                <div
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-center">{cat.name}</h3>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/categories" className="text-amber-600 font-medium hover:text-amber-800 transition-colors inline-flex items-center">
            View All Categories <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 tracking-tight mb-4">Featured Additions</h2>
              <p className="text-gray-500 max-w-2xl">Handpicked luxurious designs selected from our massive inventory just for you.</p>
            </div>
            <Link href="/products" className="text-amber-600 font-medium hover:text-amber-800 transition-colors inline-flex items-center mt-4 md:mt-0">
              View All Products <span className="ml-2">→</span>
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-10 bg-white rounded-xl shadow-sm">No featured products currently available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product: IProduct) => (
                <ProductCard key={String(product._id)} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Collections Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 tracking-tight">Curated Collections</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map(col => (
            <Link key={col.name} href={`/collections/${col.name.toLowerCase()}`} className="group block relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${col.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
                <h3 className="text-4xl font-serif font-bold mb-2 group-hover:text-amber-400 transition-colors uppercase tracking-widest">{col.name}</h3>
                <p className="text-gray-200">Shop The Collection →</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/collections" className="text-amber-600 font-medium hover:text-amber-800 transition-colors inline-flex items-center">
            Explore All 10 Master Collections <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Newsletter / Sign Up CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 rounded-3xl overflow-hidden shadow-sm border border-amber-100/50 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
            <span className="text-amber-600 font-bold tracking-widest uppercase mb-4 text-sm">Join The Inner Circle</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">Unlock Exclusive Luxury</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Create an account today to wish-list your favorite items, checkout faster, and receive early access to our newest master collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl text-center font-medium transition-all shadow-md hover:-translate-y-0.5 whitespace-nowrap">
                Create Free Account
              </Link>
              <Link href="/login" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-center font-medium transition-all">
                Log In
              </Link>
            </div>
          </div>
          <div
            className="w-full md:w-1/2 min-h-[400px] bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584305574647-0cc9ebecfee3?q=80&w=1000&auto=format&fit=crop')" }}
          />
        </div>
      </section>
    </div>
  );
}
