import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

// Post interface
export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: mongoose.Types.ObjectId | IUser;
  category: string;
  coverImage?: string;
  published: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Post schema
const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export Post model
export default mongoose.model<IPost>('Post', PostSchema);