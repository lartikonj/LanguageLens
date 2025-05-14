import { useState } from "react";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  comments: Comment[];
  articleId: number;
}

export function CommentSection({ comments, articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Format date as "X time ago"
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Create initial for avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; articleId: number; parentId?: number }) => {
      return apiRequest("POST", "/api/comments", data);
    },
    onSuccess: () => {
      setCommentText("");
      setReplyText("");
      setReplyToId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post comments.",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some text for your comment.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate({
      content: commentText,
      articleId,
    });
  };

  // Handle reply submit
  const handleReplySubmit = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post replies.",
        variant: "destructive",
      });
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: "Empty reply",
        description: "Please enter some text for your reply.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate({
      content: replyText,
      articleId,
      parentId,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Comments</h3>
      
      {/* Comment Form */}
      <div className="mb-8">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>
              {user ? getInitials(user.username) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <form onSubmit={handleCommentSubmit}>
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2"
                disabled={commentMutation.isPending}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!user || commentMutation.isPending}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Avatar>
                <AvatarFallback>{getInitials(comment.user.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{comment.user.username}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>{comment.content}</p>
                </div>
                <div className="mt-2 text-xs">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500">
                    <ThumbsUp className="h-3 w-3 mr-1" /> Like
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-gray-500 ml-2"
                    onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" /> Reply
                  </Button>
                </div>
                
                {/* Reply form */}
                {replyToId === comment.id && (
                  <div className="mt-4">
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="mb-2 text-sm"
                        disabled={commentMutation.isPending}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setReplyToId(null)}
                          disabled={commentMutation.isPending}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          size="sm" 
                          disabled={!user || commentMutation.isPending}
                        >
                          Reply
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{getInitials(reply.user.username)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-medium text-gray-900 dark:text-white">{reply.user.username}</h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            <p>{reply.content}</p>
                          </div>
                          <div className="mt-1 text-xs">
                            <Button variant="ghost" size="sm" className="h-5 px-1 text-gray-500">
                              <ThumbsUp className="h-3 w-3 mr-1" /> Like
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
