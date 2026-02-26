import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import HomePageContent from '@/components/HomePageContent';

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

export default async function Home() {
  const products = await getFeaturedProducts();

  return <HomePageContent products={products} />;
}
