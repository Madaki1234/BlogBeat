import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import BlogCard from "./blog-card";
import Pagination from "./pagination";
import { PostWithAuthor, Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface RecentPostsProps {
  posts: PostWithAuthor[];
  isLoading: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export default function RecentPosts({ 
  posts, 
  isLoading, 
  categories, 
  categoriesLoading,
  pagination 
}: RecentPostsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch posts when category or page changes
  const { data, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", { page: currentPage, limit: 10, category: selectedCategory }],
    enabled: selectedCategory !== null || currentPage > 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Use fetched data if available, otherwise use provided posts
  const displayPosts = data?.posts || posts;
  const displayPagination = data?.page 
    ? { page: data.page, totalPages: data.totalPages, total: data.total } 
    : pagination;
  const loading = postsLoading || isLoading;

  // Popular posts - taking the first 3 as an example
  const popularPosts = displayPosts.slice(0, 3);
  
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: document.getElementById('recent-posts')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would trigger a search API call
    console.log("Searching for:", searchTerm);
  };
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Recent Articles</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {loading ? (
              // Skeleton loaders for posts
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-48 md:h-full" />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex gap-2 mb-3">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : displayPosts.length > 0 ? (
              // Blog posts
              displayPosts.map((post) => (
                <BlogCard key={post.id} post={post} horizontal={true} />
              ))
            ) : (
              // No posts state
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
                <p className="text-gray-500">
                  {selectedCategory 
                    ? `No posts in the "${selectedCategory}" category yet` 
                    : "Check back later for new content"}
                </p>
                {selectedCategory && (
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {displayPosts.length > 0 && (
              <Pagination 
                currentPage={displayPagination.page}
                totalPages={displayPagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Search</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            {/* Category List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategorySelect(category.name)}
                        className={`flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-100 transition w-full text-left ${
                          selectedCategory === category.name ? 'bg-gray-100' : ''
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">
                          {category.postCount}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Popular Posts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Popular Articles</h3>
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-20 h-20 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-full mb-1" />
                        <Skeleton className="h-5 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularPosts.length > 0 ? (
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <Link key={post.id} href={`/post/${post.slug}`} className="block">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img 
                            src={post.coverImage || `https://source.unsplash.com/random/200x200?${post.category}`} 
                            alt={post.title} 
                            className="w-full h-full object-cover rounded" 
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="mx-1">•</span>
                            <span>{Math.max(1, Math.ceil(post.content.length / 1000))} min read</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No popular articles yet</p>
              )}
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg p-6 shadow-sm text-white">
              <h3 className="text-lg font-bold mb-2">Subscribe to our Newsletter</h3>
              <p className="text-blue-100 mb-4">Get the latest articles and resources delivered straight to your inbox.</p>
              <form className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-blue-100 focus-visible:ring-white/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
