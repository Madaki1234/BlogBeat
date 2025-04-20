import mongoose, { Document, Schema } from 'mongoose';

// Category interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
}

// Category schema
const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export Category model
export default mongoose.model<ICategory>('Category', CategorySchema);