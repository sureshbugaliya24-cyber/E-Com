import mongoose, { Schema, Document } from 'mongoose';

export interface IVariation {
    sku: string;
    attributes: Map<string, string>;
    priceINR: number;
    stock: number;
    images: string[];
}

export interface IProductOption {
    name: string;
    values: string[];
}

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
    options: IProductOption[];
    variations?: IVariation[];
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const VariationSchema = new Schema<IVariation>({
    sku: { type: String, required: true },
    attributes: { type: Map, of: String, required: true },
    priceINR: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
});

const ProductOptionSchema = new Schema<IProductOption>({
    name: { type: String, required: true },
    values: [{ type: String, required: true }],
});

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
        options: [ProductOptionSchema],
        variations: [VariationSchema],
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Clear the Next.js hot-reload cache before exporting to ensure variations map correctly
delete mongoose.models.Product;
export default mongoose.model<IProduct>('Product', ProductSchema);
