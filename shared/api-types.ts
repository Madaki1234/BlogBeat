export interface ApiUser {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string | Date;
}

export interface ApiPost {
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
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiPostWithAuthor extends ApiPost {
  author: ApiUser;
  liked?: boolean;
}

export interface ApiComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  createdAt: string | Date;
}

export interface ApiCommentWithAuthor extends ApiComment {
  author: ApiUser;
  replies?: ApiCommentWithAuthor[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string | Date;
  postCount?: number;
}

export interface ApiPostsResponse {
  posts: ApiPostWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
