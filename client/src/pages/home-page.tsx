import { useQuery } from "@tanstack/react-query";
import FeaturedPosts from "@/components/blog/featured-posts";
import RecentPosts from "@/components/blog/recent-posts";
import { Helmet } from "react-helmet";

export default function HomePage() {
  const { data: featuredPosts = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/posts/featured"],
    staleTime: 60 * 1000, // 1 minute
  });

  const { 
    data: postsData = { posts: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    isLoading: postsLoading
  } = useQuery({
    queryKey: ["/api/posts", { page: 1, limit: 10 }],
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <>
      <Helmet>
        <title>DevInsight - A Modern Programming Blog</title>
        <meta name="description" content="Discover insightful articles on technology, programming, and web development. Stay updated with the latest trends." />
        <meta name="keywords" content="blog, technology, programming, web development" />
        <meta property="og:title" content="DevInsight - A Modern Programming Blog" />
        <meta property="og:description" content="Discover insightful articles on technology, programming, and web development." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DevInsight - A Modern Programming Blog" />
        <meta name="twitter:description" content="Discover insightful articles on technology, programming, and web development." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Insights for Modern Developers</h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">Discover the latest trends, best practices, and deep dives into the world of programming.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#recent-posts" className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition">Start Reading</a>
              <a href="/auth" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition">Create Account</a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <FeaturedPosts posts={featuredPosts} isLoading={featuredLoading} />
      
      {/* Recent Posts */}
      <section id="recent-posts">
        <RecentPosts 
          posts={postsData.posts} 
          isLoading={postsLoading}
          categories={categories}
          categoriesLoading={categoriesLoading}
          pagination={{
            page: postsData.page,
            totalPages: postsData.totalPages,
            total: postsData.total
          }}
        />
      </section>
    </>
  );
}
