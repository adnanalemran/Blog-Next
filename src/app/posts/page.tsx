'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/models/Post';
import { format } from 'date-fns';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load posts.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  const handleLike = async (postId: string) => {
    setLiking(postId);
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      // For demo purposes, we'll use a fixed user ID
      // In a real app, this would come from your auth system
      const userId = 'demo-user-123';
      const action = post.likes?.includes(userId) ? 'unlike' : 'like';

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update likes');
      }

      const updatedPost = await response.json();
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));

      toast({
        title: 'Success',
        description: action === 'like' ? 'Post liked!' : 'Post unliked!',
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update likes.',
        variant: 'destructive',
      });
    } finally {
      setLiking(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
            <p className="text-muted-foreground mt-2">
              Browse all posts
            </p>
          </div>
          <Button onClick={() => router.push('/posts/new')}>
            Create Post
          </Button>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => {
            // For demo purposes, we'll use a fixed user ID
            // In a real app, this would come from your auth system
            const userId = 'demo-user-123';
            const isLiked = post.likes?.includes(userId);
            
            return (
              <Card key={post._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <button
                      onClick={() => router.push(`/posts/${post._id}`)}
                      className="hover:underline text-left"
                    >
                      {post.title}
                    </button>
                  </CardTitle>
                  <CardDescription>
                    Posted on {format(new Date(post.createdAt), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/posts/${post._id}`)}
                  >
                    Read More
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post._id)}
                    disabled={liking === post._id}
                    className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {post.likes?.length || 0}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
} 