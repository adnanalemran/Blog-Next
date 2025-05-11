'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

export default function MyBlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasMore: false,
    hasPrevious: false
  });
  const router = useRouter();
  const { toast } = useToast();

  const fetchMyPosts = async (page: number) => {
    if (!auth.currentUser?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/posts/my-posts?page=${page}&limit=10`, {
        headers: {
          'x-user-email': auth.currentUser.email,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      // Ensure we're setting an array of posts
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        hasMore: false,
        hasPrevious: false
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your posts. Please try again.',
        variant: 'destructive',
      });
      // Set empty array in case of error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMyPosts(1);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  const handleDelete = async (postId: string) => {
    if (!auth.currentUser) return;

    setDeletingPost(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: auth.currentUser.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(p => p._id !== postId));
      toast({
        title: 'Success',
        description: 'Post deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingPost(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchMyPosts(newPage);
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

  if (!auth.currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to view your blogs.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Blogs</h1>
        <Button onClick={() => router.push('/posts/new')}>
          Create New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any posts yet.</p>
          <Button onClick={() => router.push('/posts/new')}>
            Create Your First Post
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2   gap-4">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => router.push(`/posts/${post._id}/edit`)}
                      >
                        <Edit className="h-5 w-5 text-gray-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                            disabled={deletingPost === post._id}
                          >
                            {deletingPost === post._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this post? This action cannot be undone.
                              All comments and likes associated with this post will also be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
        </>
      )}
    </div>
  );
} 