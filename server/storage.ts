import { 
  UserModel, 
  PostModel, 
  CommentModel, 
  LikeModel,
  CategoryModel
} from './models';
import session from 'express-session';
import createMemoryStore from "memorystore";
import { Types } from 'mongoose';

// Define data types
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  bio?: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  coverImage?: string;
  published: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface PostWithAuthor extends Post {
  author: Omit<User, 'password'>;
  liked?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: Omit<User, 'password'>;
  replies?: CommentWithAuthor[];
}

export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type InsertPost = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount'>;
export type InsertComment = Omit<Comment, 'id' | 'createdAt'>;
export type InsertLike = Omit<Like, 'id' | 'createdAt'>;
export type InsertCategory = Omit<Category, 'id' | 'createdAt'>;

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost & { authorId: string }): Promise<Post>;
  getPostById(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<PostWithAuthor | undefined>;
  getPosts(page?: number, limit?: number, category?: string): Promise<{ posts: PostWithAuthor[], total: number }>;
  getFeaturedPosts(): Promise<PostWithAuthor[]>;
  getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]>;
  updatePost(id: string, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment & { authorId: string }): Promise<Comment>;
  getCommentsByPostId(postId: string): Promise<CommentWithAuthor[]>;
  deleteComment(id: string): Promise<boolean>;
  
  // Like operations
  likePost(postId: string, userId: string): Promise<Like | undefined>;
  unlikePost(postId: string, userId: string): Promise<boolean>;
  checkLiked(postId: string, userId: string): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Session store
  sessionStore: any; // Use any type for session store
}

export class MongoStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed categories on startup if none exist
    this.seedCategories();
  }

  // Helper to convert from Mongoose document to plain object
  private static documentToUser(doc: any): User | undefined {
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      username: doc.username,
      password: doc.password,
      name: doc.name,
      bio: doc.bio,
      createdAt: doc.createdAt
    };
  }

  private static documentToPost(doc: any): Post | undefined {
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      excerpt: doc.excerpt,
      authorId: doc.authorId.toString(),
      category: doc.category,
      coverImage: doc.coverImage,
      published: doc.published,
      likeCount: doc.likeCount,
      commentCount: doc.commentCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  private static documentToComment(doc: any): Comment | undefined {
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      content: doc.content,
      postId: doc.postId.toString(),
      authorId: doc.authorId.toString(),
      parentId: doc.parentId ? doc.parentId.toString() : undefined,
      createdAt: doc.createdAt
    };
  }

  private static documentToLike(doc: any): Like | undefined {
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      postId: doc.postId.toString(),
      userId: doc.userId.toString(),
      createdAt: doc.createdAt
    };
  }

  private static documentToCategory(doc: any): Category | undefined {
    if (!doc) return undefined;
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      createdAt: doc.createdAt
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const doc = await UserModel.findById(id);
      return doc ? MongoStorage.documentToUser(doc) : undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const doc = await UserModel.findOne({ username });
      return doc ? MongoStorage.documentToUser(doc) : undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel(insertUser);
      const doc = await newUser.save();
      const user = MongoStorage.documentToUser(doc);
      if (!user) {
        throw new Error('Failed to create user');
      }
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createPost(post: InsertPost & { authorId: string }): Promise<Post> {
    try {
      const newPost = new PostModel({
        ...post,
        authorId: new Types.ObjectId(post.authorId),
        likeCount: 0,
        commentCount: 0
      });
      const doc = await newPost.save();
      const convertedPost = MongoStorage.documentToPost(doc);
      if (!convertedPost) {
        throw new Error('Failed to create post');
      }
      return convertedPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<Post | undefined> {
    try {
      const doc = await PostModel.findById(id);
      return doc ? MongoStorage.documentToPost(doc) : undefined;
    } catch (error) {
      console.error('Error fetching post:', error);
      return undefined;
    }
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | undefined> {
    try {
      const doc = await PostModel.findOne({ slug }).populate('authorId');
      
      if (!doc) return undefined;
      
      const post = MongoStorage.documentToPost(doc);
      if (!post) return undefined;
      
      const author = doc.authorId as any;
      const userObj = MongoStorage.documentToUser(author);
      
      if (!userObj) return undefined;
      
      // Remove password from author
      const { password, ...authorWithoutPassword } = userObj;
      
      return {
        ...post,
        author: authorWithoutPassword
      };
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return undefined;
    }
  }

  async getPosts(page = 1, limit = 10, category?: string): Promise<{ posts: PostWithAuthor[], total: number }> {
    try {
      const query: any = {};
      
      // Add category filter if provided
      if (category) {
        query.category = category;
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get total count
      const total = await PostModel.countDocuments(query);
      
      // Get posts with authors
      const docs = await PostModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId');
      
      // Transform to PostWithAuthor[]
      const posts: PostWithAuthor[] = [];
      
      for (const doc of docs) {
        const post = MongoStorage.documentToPost(doc);
        if (!post) continue;
        
        const author = doc.authorId as any;
        const userObj = MongoStorage.documentToUser(author);
        
        if (!userObj) continue;
        
        // Remove password from author
        const { password, ...authorWithoutPassword } = userObj;
        
        posts.push({
          ...post,
          author: authorWithoutPassword
        });
      }
      
      return { posts, total };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 };
    }
  }

  async getFeaturedPosts(): Promise<PostWithAuthor[]> {
    try {
      // For simplicity, just return the 3 most recent posts as featured
      const { posts } = await this.getPosts(1, 3);
      return posts;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }

  async getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
    try {
      const docs = await PostModel.find({ authorId: new Types.ObjectId(authorId) })
        .sort({ createdAt: -1 })
        .populate('authorId');
      
      // Transform to PostWithAuthor[]
      const posts: PostWithAuthor[] = [];
      
      for (const doc of docs) {
        const post = MongoStorage.documentToPost(doc);
        if (!post) continue;
        
        const author = doc.authorId as any;
        const userObj = MongoStorage.documentToUser(author);
        
        if (!userObj) continue;
        
        // Remove password from author
        const { password, ...authorWithoutPassword } = userObj;
        
        posts.push({
          ...post,
          author: authorWithoutPassword
        });
      }
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts by author:', error);
      return [];
    }
  }

  async updatePost(id: string, data: Partial<InsertPost>): Promise<Post | undefined> {
    try {
      const doc = await PostModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
      
      return doc ? MongoStorage.documentToPost(doc) : undefined;
    } catch (error) {
      console.error('Error updating post:', error);
      return undefined;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      // Delete all related comments
      await CommentModel.deleteMany({ postId: new Types.ObjectId(id) });
      
      // Delete all related likes
      await LikeModel.deleteMany({ postId: new Types.ObjectId(id) });
      
      // Delete the post
      const result = await PostModel.findByIdAndDelete(id);
      
      return !!result;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  async createComment(comment: InsertComment & { authorId: string }): Promise<Comment> {
    try {
      // Create new comment with proper ObjectIds
      const newComment = new CommentModel({
        ...comment,
        postId: new Types.ObjectId(comment.postId),
        authorId: new Types.ObjectId(comment.authorId),
        parentId: comment.parentId ? new Types.ObjectId(comment.parentId) : undefined
      });
      
      const doc = await newComment.save();
      
      // Update post comment count
      await PostModel.findByIdAndUpdate(
        comment.postId,
        { $inc: { commentCount: 1 } }
      );
      
      const convertedComment = MongoStorage.documentToComment(doc);
      if (!convertedComment) {
        throw new Error('Failed to create comment');
      }
      return convertedComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getCommentsByPostId(postId: string): Promise<CommentWithAuthor[]> {
    try {
      // Get all comments for the post
      const docs = await CommentModel.find({ postId: new Types.ObjectId(postId) })
        .sort({ createdAt: 1 })
        .populate('authorId');
      
      // Transform to CommentWithAuthor objects
      const commentsWithAuthor: CommentWithAuthor[] = [];
      
      for (const doc of docs) {
        const comment = MongoStorage.documentToComment(doc);
        if (!comment) continue;
        
        const author = doc.authorId as any;
        const userObj = MongoStorage.documentToUser(author);
        
        if (!userObj) continue;
        
        // Remove password from author
        const { password, ...authorWithoutPassword } = userObj;
        
        commentsWithAuthor.push({
          ...comment,
          author: authorWithoutPassword,
          replies: []
        });
      }
      
      // Build comment tree
      const commentMap = new Map<string, CommentWithAuthor>();
      const rootComments: CommentWithAuthor[] = [];
      
      // First pass: initialize comment map
      for (const comment of commentsWithAuthor) {
        commentMap.set(comment.id, comment);
        
        if (!comment.parentId) {
          rootComments.push(comment);
        }
      }
      
      // Second pass: build hierarchy
      for (const comment of commentsWithAuthor) {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent && parent.replies) {
            parent.replies.push(comment);
          }
        }
      }
      
      return rootComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      // Find the comment to get its postId
      const comment = await CommentModel.findById(id);
      if (!comment) return false;
      
      // Find all replies (recursively)
      const allCommentIds = await this.findCommentIdsRecursive(id);
      
      // Delete all comments
      if (allCommentIds.length > 0) {
        await CommentModel.deleteMany({ _id: { $in: allCommentIds.map(id => new Types.ObjectId(id)) } });
      }
      
      // Update post comment count
      await PostModel.findByIdAndUpdate(
        comment.postId,
        { $inc: { commentCount: -allCommentIds.length } }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }
  
  private async findCommentIdsRecursive(parentId: string): Promise<string[]> {
    const result = [parentId];
    
    // Find direct replies
    const replies = await CommentModel.find({ parentId: new Types.ObjectId(parentId) });
    
    // Recursively find replies to replies
    for (const reply of replies) {
      if (reply && reply._id) {
        const childIds = await this.findCommentIdsRecursive(reply._id.toString());
        result.push(...childIds);
      }
    }
    
    return result;
  }

  async likePost(postId: string, userId: string): Promise<Like | undefined> {
    try {
      // Check if already liked
      const existing = await this.checkLiked(postId, userId);
      if (existing) {
        const doc = await LikeModel.findOne({
          postId: new Types.ObjectId(postId),
          userId: new Types.ObjectId(userId)
        });
        return doc ? MongoStorage.documentToLike(doc) : undefined;
      }
      
      // Create new like
      const newLike = new LikeModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId)
      });
      
      const doc = await newLike.save();
      
      // Update post like count
      await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likeCount: 1 } }
      );
      
      return MongoStorage.documentToLike(doc);
    } catch (error) {
      console.error('Error liking post:', error);
      return undefined;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    try {
      const result = await LikeModel.findOneAndDelete({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId)
      });
      
      if (!result) return false;
      
      // Update post like count
      await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likeCount: -1 } }
      );
      
      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  }

  async checkLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const count = await LikeModel.countDocuments({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId)
      });
      
      return count > 0;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const docs = await CategoryModel.find().sort({ name: 1 });
      const categories: Category[] = [];
      
      for (const doc of docs) {
        const category = MongoStorage.documentToCategory(doc);
        if (category) {
          categories.push(category);
        }
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const newCategory = new CategoryModel(category);
      const doc = await newCategory.save();
      const convertedCategory = MongoStorage.documentToCategory(doc);
      if (!convertedCategory) {
        throw new Error('Failed to create category');
      }
      return convertedCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  private async seedCategories() {
    try {
      const count = await CategoryModel.countDocuments();
      if (count > 0) return;
      
      const categories = [
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'React', slug: 'react' },
        { name: 'Node.js', slug: 'nodejs' },
        { name: 'CSS', slug: 'css' },
        { name: 'DevOps', slug: 'devops' },
        { name: 'Python', slug: 'python' },
        { name: 'Machine Learning', slug: 'machine-learning' },
        { name: 'Databases', slug: 'databases' },
        { name: 'Programming', slug: 'programming' },
        { name: 'Tech', slug: 'tech' },
        { name: 'Lifestyle', slug: 'Lifestyle' },
        { name: 'Health', slug: 'health' },
        { name: 'Travel', slug: 'travel' },
        { name: 'Food', slug: 'food' },
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Books', slug: 'books' },
        { name: 'Movies', slug: 'movies' },
        { name: 'Music', slug: 'music' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Finance', slug: 'finance' },
        { name: 'Career', slug: 'career' },
        { name: 'Education', slug: 'education' },
        { name: 'Science', slug: 'science' },
        { name: 'Other', slug: 'other' }
      ];
      
      for (const category of categories) {
        await this.createCategory(category);
      }
      
      console.log('✅ Categories seeded successfully');
    } catch (error) {
      console.error('Error seeding categories:', error);
    }
  }
}

export const storage = new MongoStorage();