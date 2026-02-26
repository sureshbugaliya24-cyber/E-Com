import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
    _id?: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    addresses: IAddress[];
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for OAuth
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        addresses: [AddressSchema],
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
