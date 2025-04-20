import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import CommentSection from "@/components/blog/comment-section";
import PostSidebar from "@/components/blog/post-sidebar";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";

export default function BlogPost() {
  const [match, params] = useRoute("/post/:slug");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/posts/${params?.slug}`],
    enabled: !!params?.slug,
  });
  
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/posts/${post?.id}/comments`],
    enabled: !!post?.id,
  });
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      if (post.liked) {
        const res = await apiRequest("DELETE", `/api/posts/${post.id}/like`);
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/posts/${post.id}/like`);
        return res.json();
      }
    },
    onSuccess: (data) => {
      if (!post) return;
      queryClient.setQueryData([`/api/posts/${params?.slug}`], {
        ...post,
        likeCount: data.likeCount,
        liked: data.liked,
      });
    }
  });
  
  if (!match) {
    navigate("/not-found");
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error Loading Post</h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : "Post not found"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  const handleLikeClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    likeMutation.mutate();
  };
  
  return (
    <>
      <Helmet>
        <title>{post.title} - DevInsight</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} - DevInsight`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - DevInsight`} />
        <meta name="twitter:description" content={post.excerpt} />
      </Helmet>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">{post.category}</span>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {Math.ceil(post.content.length / 1000)} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {post.author.avatarUrl ? (
                    <img 
                      src={post.author.avatarUrl} 
                      alt={post.author.name || post.author.username} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {(post.author.name || post.author.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{post.author.name || post.author.username}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.excerpt,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-72 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Post Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="prose lg:prose-lg max-w-none mb-12 lg:col-span-2 rich-text-content">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
            
            <PostSidebar />
          </div>
          
          {/* Post Engagement */}
          <div className="border-t border-b border-gray-200 py-6 mb-12">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  className={`flex items-center gap-2 hover:text-blue-600 transition ${post.liked ? 'text-red-500' : 'text-gray-500'}`}
                  onClick={handleLikeClick}
                  disabled={likeMutation.isPending}
                >
                  {post.liked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  <span>{post.likeCount} likes</span>
                </button>
                <button 
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
                  onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{post.commentCount} comments</span>
                </button>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-700 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div id="comments-section">
            <CommentSection 
              postId={post.id} 
              comments={comments} 
              isLoading={commentsLoading} 
            />
          </div>
        </div>
      </section>
    </>
  );
}
