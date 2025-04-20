import { users, posts, comments, likes, categories } from "@shared/schema";
import type { 
  User, InsertUser, Post, InsertPost, Comment, InsertComment, 
  Like, InsertLike, Category, InsertCategory, 
  PostWithAuthor, CommentWithAuthor 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost & { authorId: number }): Promise<Post>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<PostWithAuthor | undefined>;
  getPosts(page?: number, limit?: number, category?: string): Promise<{ posts: PostWithAuthor[], total: number }>;
  getFeaturedPosts(): Promise<PostWithAuthor[]>;
  getPostsByAuthor(authorId: number): Promise<PostWithAuthor[]>;
  updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment & { authorId: number }): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // Like operations
  likePost(postId: number, userId: number): Promise<Like | undefined>;
  unlikePost(postId: number, userId: number): Promise<boolean>;
  checkLiked(postId: number, userId: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private postsStore: Map<number, Post>;
  private commentsStore: Map<number, Comment>;
  private likesStore: Map<number, Like>;
  private categoriesStore: Map<number, Category>;
  private slugToPostId: Map<string, number>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private likeIdCounter: number;
  private categoryIdCounter: number;

  constructor() {
    this.usersStore = new Map();
    this.postsStore = new Map();
    this.commentsStore = new Map();
    this.likesStore = new Map();
    this.categoriesStore = new Map();
    this.slugToPostId = new Map();
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.likeIdCounter = 1;
    this.categoryIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Seed categories
    this.seedCategories();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.usersStore.set(id, user);
    return user;
  }
  
  // Post operations
  async createPost(post: InsertPost & { authorId: number }): Promise<Post> {
    const id = this.postIdCounter++;
    const newPost: Post = {
      ...post,
      id,
      createdAt: new Date(),
    };
    
    this.postsStore.set(id, newPost);
    this.slugToPostId.set(post.slug, id);
    
    // Update category post count
    if (post.category) {
      const category = Array.from(this.categoriesStore.values()).find(
        (cat) => cat.name.toLowerCase() === post.category.toLowerCase()
      );
      
      if (category) {
        const updatedCategory = { ...category, postCount: category.postCount + 1 };
        this.categoriesStore.set(category.id, updatedCategory);
      }
    }
    
    return newPost;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.postsStore.get(id);
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | undefined> {
    const postId = this.slugToPostId.get(slug);
    if (!postId) return undefined;
    
    const post = this.postsStore.get(postId);
    if (!post) return undefined;
    
    const author = this.usersStore.get(post.authorId);
    if (!author) return undefined;
    
    const { password, ...authorWithoutPassword } = author;
    
    const likeCount = Array.from(this.likesStore.values()).filter(
      (like) => like.postId === post.id
    ).length;
    
    const commentCount = Array.from(this.commentsStore.values()).filter(
      (comment) => comment.postId === post.id
    ).length;
    
    return {
      ...post,
      author: authorWithoutPassword,
      likeCount,
      commentCount,
    };
  }

  async getPosts(page = 1, limit = 10, category?: string): Promise<{ posts: PostWithAuthor[], total: number }> {
    let filteredPosts = Array.from(this.postsStore.values())
      .filter(post => post.published);
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const total = filteredPosts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = filteredPosts.slice(start, end);
    
    const postsWithAuthors: PostWithAuthor[] = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = this.usersStore.get(post.authorId);
        if (!author) throw new Error(`Author not found for post ${post.id}`);
        
        const { password, ...authorWithoutPassword } = author;
        
        const likeCount = Array.from(this.likesStore.values()).filter(
          (like) => like.postId === post.id
        ).length;
        
        const commentCount = Array.from(this.commentsStore.values()).filter(
          (comment) => comment.postId === post.id
        ).length;
        
        return {
          ...post,
          author: authorWithoutPassword,
          likeCount,
          commentCount,
        };
      })
    );
    
    return { posts: postsWithAuthors, total };
  }

  async getFeaturedPosts(): Promise<PostWithAuthor[]> {
    // Get 3 most recent posts (would be different logic in real app)
    const allPosts = Array.from(this.postsStore.values())
      .filter(post => post.published)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
    
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const author = this.usersStore.get(post.authorId);
        if (!author) throw new Error(`Author not found for post ${post.id}`);
        
        const { password, ...authorWithoutPassword } = author;
        
        const likeCount = Array.from(this.likesStore.values()).filter(
          (like) => like.postId === post.id
        ).length;
        
        const commentCount = Array.from(this.commentsStore.values()).filter(
          (comment) => comment.postId === post.id
        ).length;
        
        return {
          ...post,
          author: authorWithoutPassword,
          likeCount,
          commentCount,
        };
      })
    );
    
    return postsWithAuthors;
  }

  async getPostsByAuthor(authorId: number): Promise<PostWithAuthor[]> {
    const filteredPosts = Array.from(this.postsStore.values())
      .filter(post => post.authorId === authorId && post.published)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    const author = this.usersStore.get(authorId);
    if (!author) throw new Error(`Author not found with id ${authorId}`);
    
    const { password, ...authorWithoutPassword } = author;
    
    const postsWithAuthors = filteredPosts.map(post => {
      const likeCount = Array.from(this.likesStore.values()).filter(
        (like) => like.postId === post.id
      ).length;
      
      const commentCount = Array.from(this.commentsStore.values()).filter(
        (comment) => comment.postId === post.id
      ).length;
      
      return {
        ...post,
        author: authorWithoutPassword,
        likeCount,
        commentCount,
      };
    });
    
    return postsWithAuthors;
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.postsStore.get(id);
    if (!post) return undefined;
    
    // If slug is being updated, update the mapping
    if (data.slug && data.slug !== post.slug) {
      this.slugToPostId.delete(post.slug);
      this.slugToPostId.set(data.slug, id);
    }
    
    const updatedPost = { ...post, ...data };
    this.postsStore.set(id, updatedPost);
    
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const post = this.postsStore.get(id);
    if (!post) return false;
    
    // Remove slug mapping
    this.slugToPostId.delete(post.slug);
    
    // Delete all comments for this post
    for (const [commentId, comment] of this.commentsStore.entries()) {
      if (comment.postId === id) {
        this.commentsStore.delete(commentId);
      }
    }
    
    // Delete all likes for this post
    for (const [likeId, like] of this.likesStore.entries()) {
      if (like.postId === id) {
        this.likesStore.delete(likeId);
      }
    }
    
    // Update category post count
    if (post.category) {
      const category = Array.from(this.categoriesStore.values()).find(
        (cat) => cat.name.toLowerCase() === post.category.toLowerCase()
      );
      
      if (category && category.postCount > 0) {
        const updatedCategory = { ...category, postCount: category.postCount - 1 };
        this.categoriesStore.set(category.id, updatedCategory);
      }
    }
    
    return this.postsStore.delete(id);
  }
  
  // Comment operations
  async createComment(comment: InsertComment & { authorId: number }): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    
    this.commentsStore.set(id, newComment);
    return newComment;
  }

  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const comments = Array.from(this.commentsStore.values()).filter(
      (comment) => comment.postId === postId
    );
    
    // Group comments by parent/child relationship
    const topLevelComments = comments.filter(comment => !comment.parentId);
    const commentReplies = comments.filter(comment => comment.parentId);
    
    // Create a map of comments with their authors
    const commentsWithAuthors = await Promise.all(
      topLevelComments.map(async (comment) => {
        const author = this.usersStore.get(comment.authorId);
        if (!author) throw new Error(`Author not found for comment ${comment.id}`);
        
        const { password, ...authorWithoutPassword } = author;
        
        // Find replies for this comment
        const replies = commentReplies
          .filter(reply => reply.parentId === comment.id)
          .map(reply => {
            const replyAuthor = this.usersStore.get(reply.authorId);
            if (!replyAuthor) throw new Error(`Author not found for reply ${reply.id}`);
            
            const { password: replyPassword, ...replyAuthorWithoutPassword } = replyAuthor;
            
            return {
              ...reply,
              author: replyAuthorWithoutPassword,
            };
          });
        
        return {
          ...comment,
          author: authorWithoutPassword,
          replies: replies.length > 0 ? replies : undefined,
        };
      })
    );
    
    return commentsWithAuthors;
  }

  async deleteComment(id: number): Promise<boolean> {
    // Also delete any replies to this comment
    for (const [commentId, comment] of this.commentsStore.entries()) {
      if (comment.parentId === id) {
        this.commentsStore.delete(commentId);
      }
    }
    
    return this.commentsStore.delete(id);
  }
  
  // Like operations
  async likePost(postId: number, userId: number): Promise<Like | undefined> {
    // Check if already liked
    const existingLike = Array.from(this.likesStore.values()).find(
      like => like.postId === postId && like.userId === userId
    );
    
    if (existingLike) {
      return existingLike;
    }
    
    // Create new like
    const id = this.likeIdCounter++;
    const like: Like = {
      id,
      postId,
      userId,
      createdAt: new Date(),
    };
    
    this.likesStore.set(id, like);
    return like;
  }

  async unlikePost(postId: number, userId: number): Promise<boolean> {
    const likeToRemove = Array.from(this.likesStore.entries()).find(
      ([_, like]) => like.postId === postId && like.userId === userId
    );
    
    if (!likeToRemove) return false;
    
    return this.likesStore.delete(likeToRemove[0]);
  }

  async checkLiked(postId: number, userId: number): Promise<boolean> {
    return Array.from(this.likesStore.values()).some(
      like => like.postId === postId && like.userId === userId
    );
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoriesStore.values()).sort((a, b) => 
      b.postCount - a.postCount
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = {
      ...category,
      id,
      postCount: 0,
    };
    
    this.categoriesStore.set(id, newCategory);
    return newCategory;
  }
  
  // Helper to seed initial categories
  private seedCategories() {
    const categories = [
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'MongoDB', slug: 'mongodb' },
      { name: 'Express', slug: 'express' },
      { name: 'Security', slug: 'security' },
      { name: 'Architecture', slug: 'architecture' },
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
  }
}

export const storage = new MemStorage();
