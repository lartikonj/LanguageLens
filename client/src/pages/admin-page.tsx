
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Article, Message } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingArticles, isLoading: loadingArticles } = useQuery({
    queryKey: ["admin/pending-articles"],
    enabled: !!user?.isAdmin,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["admin/messages"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <p>Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Articles</TabsTrigger>
          <TabsTrigger value="messages">User Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {loadingArticles ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : pendingArticles?.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    By {article.author?.username} on {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleApprove(article.id)}>Approve</Button>
                    <Button variant="destructive" onClick={() => handleReject(article.id)}>
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid gap-4">
            {loadingMessages ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : messages?.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <CardTitle>From: {message.user.username}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{message.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
