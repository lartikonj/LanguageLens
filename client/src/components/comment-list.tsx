import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Comment } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import CommentForm from "./comment-form";

type CommentWithUserAndReplies = Comment & {
  user: {
    id: number;
    username: string;
  };
  replies?: CommentWithUserAndReplies[];
};

type CommentListProps = {
  articleId: number;
};

export default function CommentList({ articleId }: CommentListProps) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useQuery<CommentWithUserAndReplies[]>({
    queryKey: [`/api/articles/${articleId}/comments`],
  });

  // State for replies
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading comments: {error.message}</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{t("article.noComments")}</p>
      </div>
    );
  }

  // Organize comments into a tree structure (top-level comments and their replies)
  const topLevelComments: CommentWithUserAndReplies[] = [];
  const commentMap = new Map<number, CommentWithUserAndReplies>();

  // First pass: collect all comments in a map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into parent-child relationships
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      // This is a reply
      const parent = commentMap.get(comment.parentId);
      if (parent && parent.replies) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(commentWithReplies);
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatCommentDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Component to render a single comment
  const CommentItem = ({ comment }: { comment: CommentWithUserAndReplies }) => (
    <div className="flex space-x-4 rtl:space-x-reverse" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(comment.user.username)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {comment.user.username}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {comment.createdAt ? formatCommentDate(comment.createdAt.toString()) : "Just now"}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          <p>{comment.content}</p>
        </div>
        <div className="mt-2 text-xs flex items-center">
          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ThumbsUp className="mr-1 h-4 w-4" />
            <span>Like</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ml-2"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            <span>{t("article.reply")}</span>
          </Button>
        </div>
        
        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-4">
            <CommentForm 
              articleId={articleId} 
              parentId={comment.id}
              onSuccess={() => setReplyingTo(null)}
              placeholder={`${t("article.replyTo")} ${comment.user.username}...`}
            />
          </div>
        )}
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 ml-6 rtl:ml-0 rtl:mr-6">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {topLevelComments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      
      {comments.length > 5 && (
        <div className="text-center">
          <Button variant="outline">
            {t("article.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
