import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

type CommentFormProps = {
  articleId: number;
  parentId?: number;
  onSuccess?: () => void;
  placeholder?: string;
};

export default function CommentForm({
  articleId,
  parentId,
  onSuccess,
  placeholder,
}: CommentFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isRtl } = useLanguage();
  const [content, setContent] = useState("");

  const postComment = useMutation({
    mutationFn: async () => {
      if (!content.trim()) {
        throw new Error("Comment cannot be empty");
      }

      const res = await apiRequest("POST", `/api/articles/${articleId}/comments`, {
        content: content.trim(),
        parentId: parentId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({
        title: t("success.commentPosted"),
        description: t("success.commentPosted.description"),
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: t("error.comment"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: t("error.login.required"),
        description: t("error.login.required.description"),
        variant: "destructive",
      });
      return;
    }
    postComment.mutate();
  };

  if (!user) {
    return (
      <div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("auth.loginToComment")}
        </p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex space-x-4 rtl:space-x-reverse">
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
            <Textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full py-3 border-0 resize-none focus:ring-0 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={placeholder || t("article.addComment")}
              disabled={postComment.isPending}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={postComment.isPending || !content.trim()}
            >
              {postComment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading")}
                </>
              ) : parentId ? (
                t("article.reply")
              ) : (
                t("article.postComment")
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
