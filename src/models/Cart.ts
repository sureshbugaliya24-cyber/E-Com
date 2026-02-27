import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: {
        productId: mongoose.Types.ObjectId;
        variationName?: string;
        quantity: number;
    }[];
}

const CartSchema: Schema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                variationName: { type: String, required: false },
                quantity: { type: Number, required: true, min: 1, default: 1 },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
