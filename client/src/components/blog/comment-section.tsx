import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ApiCommentWithAuthor } from "@shared/api-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Heart, Reply, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

type CommentForm = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  postId: string;
  comments: ApiCommentWithAuthor[];
  isLoading: boolean;
}

export default function CommentSection({ postId, comments, isLoading }: CommentSectionProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Form for creating comments
  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Form for replies
  const replyForm = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentForm) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        ...data,
        postId,
        parentId: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      form.reset();
    },
  });
  
  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async ({ data, parentId }: { data: CommentForm, parentId: string }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        ...data,
        postId,
        parentId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      replyForm.reset();
      setReplyingTo(null);
    },
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    },
  });
  
  const onSubmit = (data: CommentForm) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    createCommentMutation.mutate(data);
  };
  
  const onReplySubmit = (data: CommentForm) => {
    if (!user || replyingTo === null) return;
    createReplyMutation.mutate({ data, parentId: replyingTo });
  };
  
  const handleDeleteComment = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };
  
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-6">
        Comments ({isLoading ? "..." : comments.length})
      </h3>
      
      {/* Comment Form */}
      <div className="mb-8">
        <div className="flex gap-4">
          <div className="mt-1">
            {user ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name || user.username} />
                <AvatarFallback>
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">?</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={user ? "Write a comment..." : "Sign in to comment"}
                          className="resize-none"
                          rows={3}
                          disabled={!user || createCommentMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  {user ? (
                    <Button 
                      type="submit" 
                      disabled={createCommentMutation.isPending}
                      className="bg-primary"
                    >
                      {createCommentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => navigate("/auth")}>
                      Sign in to comment
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          // Actual comments
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="mt-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.avatarUrl || ""} alt={comment.author.name || comment.author.username} />
                  <AvatarFallback>
                    {(comment.author.name || comment.author.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {comment.author.name || comment.author.username}
                        {comment.author.id === String(user?.id) && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {user && (comment.author.id === String(user.id)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500 hover:text-primary">
                      <Heart className="h-4 w-4" />
                      <span>Like</span>
                    </Button>
                    {user && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-gray-500 hover:text-primary"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-4 ml-6">
                    <Form {...replyForm}>
                      <form onSubmit={replyForm.handleSubmit(onReplySubmit)} className="space-y-2">
                        <FormField
                          control={replyForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Write a reply..."
                                  className="resize-none"
                                  rows={2}
                                  disabled={createReplyMutation.isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={createReplyMutation.isPending}
                          >
                            {createReplyMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> 
                                Posting...
                              </>
                            ) : (
                              "Post Reply"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
                
                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.author.avatarUrl || ""} alt={reply.author.name || reply.author.username} />
                            <AvatarFallback>
                              {(reply.author.name || reply.author.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {reply.author.name || reply.author.username}
                                  {reply.author.id === String(user?.id) && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                              {user && (reply.author.id === String(user.id)) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteComment(reply.id)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <p className="text-gray-700">{reply.content}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="h-7 gap-1 text-gray-500 hover:text-primary text-xs">
                                <Heart className="h-3 w-3" />
                                <span>Like</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          // No comments state
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-600 mb-2">No comments yet</h4>
            <p className="text-gray-500 text-sm mb-4">Be the first to share your thoughts!</p>
            {!user && (
              <Button onClick={() => navigate("/auth")}>
                Sign in to comment
              </Button>
            )}
          </div>
        )}
        
        {comments.length > 0 && comments.length >= 5 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load more comments</Button>
          </div>
        )}
      </div>
    </div>
  );
}
