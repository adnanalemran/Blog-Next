import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostPageProps {
  params: {
    id: string;
  };
}

async function getPost(id: string) {
  try {
    await connectDB();
    const post = await Post.findById(id);
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-4xl font-bold tracking-tight">
                {post.title}
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription className="text-lg">
              Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
            <div className="flex items-center gap-6 pt-6 border-t">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span>{post.likes.length} Likes</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.length || 0} Comments</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 