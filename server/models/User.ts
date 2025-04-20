import mongoose, { Document, Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  bio?: string;
  createdAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Don't return the password in queries by default
UserSchema.set('toJSON', {
  transform: (_, ret) => {
    const result = { ...ret };
    delete result.password;
    return result;
  }
});

// Export User model
export default mongoose.model<IUser>('User', UserSchema);