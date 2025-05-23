'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { PostMeta } from '@/components/posts/PostMeta';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  publishedAt: string;
  likes: string[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasMore: false,
    hasPrevious: false
  });
  const router = useRouter();
  const { toast } = useToast();

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handleLike = async (postId: string) => {
    if (!auth.currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLikeLoading(postId);
      const post = posts.find(p => p._id === postId);
      const isLiked = post?.likes.includes(auth.currentUser.uid);
      const action = isLiked ? 'unlike' : 'like';

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const updatedPost = await response.json();
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));

      toast({
        title: isLiked ? 'Post Unliked' : 'Post Liked',
        description: isLiked ? 'You have unliked this post.' : 'You have liked this post.',
      });
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLikeLoading(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
         
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
     
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">All Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {posts.map((post) => (
            <Card key={post._id} className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-card-foreground">{post.title}</CardTitle>
                <PostMeta 
                  author={post.author} 
                  publishedAt={post.publishedAt || post.createdAt} 
                  className="text-sm"
                />
              </CardHeader>
              <CardContent className='min-h-[80px]'>
                <p className="text-muted-foreground line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post._id)}
                  disabled={likeLoading === post._id}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      post.likes.includes(auth.currentUser?.email || "")
                        ? "fill-current text-red-500"
                        : ""
                    }`}
                  />
                  {post.likes.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/posts/${post._id}`)}
                  className="text-primary hover:text-primary/80"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                aria-label="Previous page"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">{pagination.currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasMore}
                aria-label="Next page"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalPosts)} of {pagination.totalPosts} posts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}   