import { Request, Response } from "express";
import { storage } from "../storage";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1),
  postId: z.string().min(1),
  parentId: z.string().min(1).optional().nullable(),
});

export const blogController = {
  // Posts
  async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      
      const { posts, total } = await storage.getPosts(page, limit, category);
      
      // Add 'liked' flag for authenticated users
      const postsWithLikedStatus = posts.map(post => {
        if (req.isAuthenticated()) {
          return {
            ...post,
            liked: false,
          };
        }
        return post;
      });

      if (req.isAuthenticated()) {
        await Promise.all(
          postsWithLikedStatus.map(async (post) => {
            post.liked = await storage.checkLiked(post.id, req.user!.id);
          }),
        );
      }
      
      res.json({ 
        posts: postsWithLikedStatus,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  },
  
  async getFeaturedPosts(req: Request, res: Response) {
    try {
      const featuredPosts = await storage.getFeaturedPosts();
      
      // Add 'liked' flag for authenticated users
      const postsWithLikedStatus = featuredPosts.map(post => {
        if (req.isAuthenticated()) {
          return {
            ...post,
            liked: false,
          };
        }
        return post;
      });

      if (req.isAuthenticated()) {
        await Promise.all(
          postsWithLikedStatus.map(async (post) => {
            post.liked = await storage.checkLiked(post.id, req.user!.id);
          }),
        );
      }
      
      res.json(postsWithLikedStatus);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      res.status(500).json({ message: 'Failed to fetch featured posts' });
    }
  },
  
  async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Add 'liked' flag for authenticated users
      if (req.isAuthenticated()) {
        const liked = await storage.checkLiked(post.id, req.user!.id);
        post.liked = liked;
      }
      
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: 'Failed to fetch post' });
    }
  },
  
  async createPost(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const post = await storage.createPost({
        ...validation.data,
        coverImage: validation.data.coverImage ?? undefined,
        published: validation.data.published ?? true,
        authorId: req.user!.id
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  },
  
  async updatePost(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const postId = req.params.id;
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }
      
      const validation = insertPostSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const updatedPost = await storage.updatePost(postId, {
        ...validation.data,
        coverImage: validation.data.coverImage ?? undefined,
      });
      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Failed to update post' });
    }
  },
  
  async deletePost(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const postId = req.params.id;
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }
      
      const success = await storage.deletePost(postId);
      
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: 'Failed to delete post' });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: 'Failed to delete post' });
    }
  },
  
  // Comments
  async getComments(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  },
  
  async createComment(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const postId = req.params.postId;
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const validation = createCommentSchema.safeParse({
        ...req.body,
        postId,
      });
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const comment = await storage.createComment({
        ...validation.data,
        parentId: validation.data.parentId ?? undefined,
        authorId: req.user!.id,
      });
      
      // Get the author details for the response
      const author = await storage.getUser(req.user!.id);
      if (!author) {
        throw new Error('Author not found');
      }
      
      const { password, ...authorWithoutPassword } = author;
      
      res.status(201).json({
        ...comment,
        author: authorWithoutPassword,
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  },
  
  async deleteComment(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const commentId = req.params.id;
      const comment = await storage.getCommentById(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      if (comment.authorId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
      
      const success = await storage.deleteComment(commentId);
      
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: 'Failed to delete comment' });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  },
  
  // Likes
  async likePost(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const postId = req.params.postId;
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const like = await storage.likePost(postId, req.user!.id);
      
      if (!like) {
        return res.status(400).json({ message: 'Failed to like post' });
      }
      
      // Get updated like count
      const likeCount = await storage.getLikeCountByPostId(postId);
      
      res.status(201).json({ likeCount, liked: true });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ message: 'Failed to like post' });
    }
  },
  
  async unlikePost(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const postId = req.params.postId;
      const success = await storage.unlikePost(postId, req.user!.id);
      
      if (!success) {
        return res.status(400).json({ message: 'Post was not liked' });
      }
      
      // Get updated like count
      const likeCount = await storage.getLikeCountByPostId(postId);
      
      res.json({ likeCount, liked: false });
    } catch (error) {
      console.error('Error unliking post:', error);
      res.status(500).json({ message: 'Failed to unlike post' });
    }
  },
  
  // Categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  },
};
