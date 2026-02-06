import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiCategory, ApiPostsResponse } from "@shared/api-types";

export default function PostSidebar() {
  const { data: relatedPostsData, isLoading: relatedLoading } = useQuery<ApiPostsResponse>({
    queryKey: ["/api/posts", { limit: 2 }],
    staleTime: 60 * 1000, // 1 minute
  });
  
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const relatedPosts = relatedPostsData?.posts ?? [];

  return (
    <div className="space-y-8">
      {/* Tags/Categories */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Categories</h3>
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/?category=${category.slug}`}
                className="bg-white border border-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Author Bio - Would typically come from the post data */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">About the Author</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">A</span>
          </div>
          <div>
            <div className="font-medium">Author</div>
            <div className="text-sm text-gray-500">Software Developer</div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          A passionate developer who loves sharing knowledge about web development, programming best practices, and emerging technologies.
        </p>
      </div>
      
      {/* Related Posts */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Related Articles</h3>
        {relatedLoading ? (
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded" />
                <div>
                  <Skeleton className="h-5 w-36 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : relatedPosts.length > 0 ? (
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="block group">
                <div className="flex gap-3">
                  <div className="w-16 h-16">
                    <img 
                      src={post.coverImage || `https://source.unsplash.com/random/200x200?${post.category}`} 
                      alt={post.title} 
                      className="w-full h-full object-cover rounded" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No related articles found</p>
        )}
      </div>
      
      {/* Share Links */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Share This Article</h3>
        <div className="flex gap-3">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank');
            }}
            className="w-9 h-9 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
            }}
            className="w-9 h-9 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
            }}
            className="w-9 h-9 bg-[#0A66C2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (navigator.share) {
                navigator.share({
                  title: document.title,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="w-9 h-9 bg-gray-700 text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
