import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const sampleProducts = [
  {
    slug: 'divine-gold-necklace',
    name: {
      en: 'Divine Gold Necklace',
      hi: 'दिव्य विंटेज गोल्ड हार',
    },
    description: {
      en: 'An elegant 22k gold necklace crafted with intricate traditional designs, perfect for weddings and special occasions.',
      hi: 'जटिल पारंपरिक डिजाइनों के साथ तैयार एक सुरुचिपूर्ण 22k सोने का हार, शादियों और विशेष अवसरों के लिए एकदम सही।',
    },
    basePriceINR: 125000,
    images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop'],
    category: 'Necklaces',
    stock: 5,
    isFeatured: true,
  },
  {
    slug: 'emerald-diamond-ring',
    name: {
      en: 'Emerald Diamond Ring',
      hi: 'पन्ना और हीरे की अंगूठी',
    },
    description: {
      en: 'A stunning ring featuring a central emerald surrounded by brilliant-cut diamonds set in 18k white gold.',
      hi: '18k सफेद सोने में सेट शानदार कटे हुए हीरों से घिरे केंद्रीय पन्ने वाली एक शानदार अंगूठी।',
    },
    basePriceINR: 85000,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop'],
    category: 'Rings',
    stock: 12,
    isFeatured: true,
  },
  {
    slug: 'traditional-jhumkas',
    name: {
      en: 'Traditional Gold Jhumkas',
      hi: 'पारंपरिक सोने के झुमके',
    },
    description: {
      en: 'Classic Indian jhumkas crafted in 22k antique gold with delicate pearl drops.',
      hi: 'नाज़ुक मोती की बूंदों के साथ 22k एंटीक सोने में तैयार किए गए क्लासिक भारतीय झुमके।',
    },
    basePriceINR: 65000,
    images: ['https://images.unsplash.com/photo-1599643478514-4a410f060896?q=80&w=800&auto=format&fit=crop'],
    category: 'Earrings',
    stock: 8,
    isFeatured: true,
  },
  {
    slug: 'diamond-tennis-bracelet',
    name: {
      en: 'Diamond Tennis Bracelet',
      hi: 'डायमंड टेनिस कंगन',
    },
    description: {
      en: 'A continuous line of perfectly matched diamonds set in platinum, a timeless addition to any collection.',
      hi: 'प्लैटिनम में पूरी तरह से मेल खाने वाले हीरों की एक सतत रेखा, किसी भी संग्रह के लिए एक कालातीत अतिरिक्त।',
    },
    basePriceINR: 210000,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'],
    category: 'Bracelets',
    stock: 3,
    isFeatured: true,
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDB();
