import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    slug: string;
    name: {
        en: string;
        hi: string;
    };
    description: {
        en: string;
        hi: string;
    };
    basePriceINR: number;
    images: string[];
    category: string;
    collectionName: string; // New explicitly attached cross-matrix index
    stock: number;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        slug: { type: String, required: true, unique: true },
        name: {
            en: { type: String, required: true },
            hi: { type: String, required: true },
        },
        description: {
            en: { type: String, required: true },
            hi: { type: String, required: true },
        },
        basePriceINR: { type: Number, required: true },
        images: [{ type: String }],
        category: { type: String, required: true },
        collectionName: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
