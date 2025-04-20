import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

// Comment interface
export interface IComment extends Document {
  content: string;
  postId: mongoose.Types.ObjectId | IPost;
  authorId: mongoose.Types.ObjectId | IUser;
  parentId?: mongoose.Types.ObjectId | IComment;
  createdAt: Date;
}

// Comment schema
const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export Comment model
export default mongoose.model<IComment>('Comment', CommentSchema);