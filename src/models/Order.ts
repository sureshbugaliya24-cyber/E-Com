import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId | string;
    quantity: number;
    price: number; // Snapshot of price at time of purchase
    name: string; // Snapshot of product name
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId | string;
    items: IOrderItem[];
    shippingAddress: {
        fullName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    };
    totalAmountINR: number;
    currencyAtPurchase: string;
    paymentStatus: 'Pending' | 'Paid' | 'Failed';
    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true },
});

const OrderSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [OrderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
        },
        totalAmountINR: { type: Number, required: true },
        currencyAtPurchase: { type: String, default: 'INR' },
        paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
        orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
