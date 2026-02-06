import { Link } from "wouter";
import { format } from "date-fns";
import { ApiPostWithAuthor } from "@shared/api-types";

interface BlogCardProps {
  post: ApiPostWithAuthor;
  featured?: boolean;
  horizontal?: boolean;
}

export default function BlogCard({ post, featured = false, horizontal = false }: BlogCardProps) {
  // Format the post date
  const formattedDate = format(new Date(post.createdAt), "MMM d, yyyy");
  
  // Determine how many minutes to read (rough estimate)
  const readTime = Math.max(1, Math.ceil(post.content.length / 1000));
  
  if (horizontal) {
    return (
      <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={post.coverImage || `https://source.unsplash.com/random/800x600?${post.category}`} 
              alt={post.title} 
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex gap-2 mb-3">
              <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">{post.category}</span>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{readTime} min read</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {post.author.avatarUrl ? (
                    <img 
                      src={post.author.avatarUrl} 
                      alt={post.author.name || post.author.username} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {(post.author.name || post.author.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{post.author.name || post.author.username}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{formattedDate}</span>
                <Link href={`/post/${post.slug}`} className="text-primary hover:text-blue-700 font-medium">
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }
  
  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <Link href={`/post/${post.slug}`} className="block">
        <img 
          src={post.coverImage || `https://source.unsplash.com/random/800x600?${post.category}`} 
          alt={post.title} 
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <div className="flex gap-2 mb-3">
            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">{post.category}</span>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{readTime} min read</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                {post.author.avatarUrl ? (
                  <img 
                    src={post.author.avatarUrl} 
                    alt={post.author.name || post.author.username} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {(post.author.name || post.author.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{post.author.name || post.author.username}</span>
            </div>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
