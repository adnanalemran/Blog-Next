'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Posts</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl cursor-pointer hover:text-blue-600"
                onClick={() => router.push(`/posts/${post._id}`)}>
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => handleLike(post._id)}
                    disabled={likeLoading === post._id}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        post.likes.includes(auth.currentUser?.uid || '')
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-500'
                      }`}
                    />
                    <span>{post.likes.length}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => router.push(`/posts/${post._id}`)}
                  >
                    <MessageCircle className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasMore}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 