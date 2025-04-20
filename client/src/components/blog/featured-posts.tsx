import { Link } from "wouter";
import BlogCard from "./blog-card";
import { PostWithAuthor } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedPostsProps {
  posts: PostWithAuthor[];
  isLoading: boolean;
}

export default function FeaturedPosts({ posts, isLoading }: FeaturedPostsProps) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Articles</h2>
          <Link href="/" className="text-primary hover:text-blue-700 font-medium flex items-center gap-2">
            View all 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Skeleton loaders
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="w-full h-48" />
                <div className="p-5">
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            // Actual featured posts
            posts.map((post) => (
              <BlogCard key={post.id} post={post} featured={true} />
            ))
          ) : (
            // No posts state
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No featured posts yet</h3>
              <p className="text-gray-500">Check back later for featured content</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
