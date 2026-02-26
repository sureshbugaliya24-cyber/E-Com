import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Product from './src/models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const collections = [
    'Bridal', 'Heritage', 'Modern', 'Temple', 'Mens',
    'Everyday', 'Royal', 'Minimalist', 'Festive', 'Antique'
];

const categories = [
    'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles',
    'Pendants', 'Mangalsutras', 'Nose Pins', 'Anklets', 'Chains'
];

// Unsplash images fitting the theme
const luxuryImages = [
    'https://images.unsplash.com/photo-1599643478514-4a4e09f52f5e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584305574647-0cc9ebecfee3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602751584552-8ba730ff2f3e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543294001-f76eadcff8ba?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573408301145-b98c642231ab?q=80&w=800&auto=format&fit=crop'
];

const generateProducts = () => {
    const products = [];
    let counter = 1;

    for (const collection of collections) {
        for (const category of categories) {

            // Randomly select 2 images
            const shuffledImages = [...luxuryImages].sort(() => 0.5 - Math.random());
            const selectedImages = shuffledImages.slice(0, 2);

            // Base Prices mapped vaguely to Categories for realism
            let basePrice = 5000;
            if (category === 'Necklaces' || category === 'Mangalsutras') basePrice = 25000 + (Math.random() * 50000);
            if (category === 'Rings' || category === 'Earrings') basePrice = 8000 + (Math.random() * 20000);
            if (category === 'Bangles' || category === 'Bracelets') basePrice = 30000 + (Math.random() * 40000);
            if (collection === 'Bridal' || collection === 'Royal') basePrice *= 2.5; // Premium multiplier

            products.push({
                slug: `${collection.toLowerCase()}-${category.toLowerCase().replace(' ', '-')}-${counter}`,
                name: {
                    en: `${collection} Excellence ${category}`,
                    hi: `${collection} उत्कृष्ट ${category} (Hindi Placeholder)`
                },
                description: {
                    en: `A stunning piece from our exclusive ${collection} collection. Crafted with precision, this ${category.toLowerCase()} represents the pinnacle of modern luxury blended with timeless tradition. Perfect for adding elegance to any attire.`,
                    hi: `हमारे विशेष ${collection} संग्रह से एक शानदार टुकड़ा। सटीकता के साथ तैयार किया गया, यह ${category.toLowerCase()} आधुनिक विलासिता और कालातीत परंपरा के मिश्रण का प्रतिनिधित्व करता है। (Hindi Placeholder)`
                },
                basePriceINR: Math.floor(basePrice),
                images: selectedImages,
                category: category,
                collectionName: collection,
                stock: Math.floor(Math.random() * 20) + 1, // 1 to 20 items in stock
                isFeatured: Math.random() > 0.8 // ~20% chance to be featured on homepage
            });
            counter++;
        }
    }
    return products;
};

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        console.log('Clearing existing products...');
        await Product.deleteMany({});
        console.log('Cleared.');

        const newProducts = generateProducts();
        console.log(`Inserting ${newProducts.length} newly generated products...`);

        await Product.insertMany(newProducts);
        console.log('Database seeded successfully with 100 heavily detailed products!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seed();
