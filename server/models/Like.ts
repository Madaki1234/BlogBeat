import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

// Like interface
export interface ILike extends Document {
  postId: mongoose.Types.ObjectId | IPost;
  userId: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
}

// Like schema
const LikeSchema = new Schema<ILike>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can only like a post once
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Export Like model
export default mongoose.model<ILike>('Like', LikeSchema);