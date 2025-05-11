'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/models/Post';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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

interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          fetch(`/api/posts/${params.id}`),
          fetch(`/api/posts/${params.id}/comments`)
        ]);
        
        if (!postResponse.ok) {
          throw new Error('Failed to fetch post');
        }
        
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const postData = await postResponse.json();
        const commentsData = await commentsResponse.json();
        
        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post or comments.',
          variant: 'destructive',
        });
        router.push('/posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [params.id, router, toast]);

  const handleLike = async () => {
    if (!post || !user) return;
    
    setLiking(true);
    try {
      const userId = user.uid;
      const action = post.likes?.includes(userId) ? 'unlike' : 'like';

      const response = await fetch(`/api/posts/${params.id}`, {
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
      setPost(updatedPost);

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
      setLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          author: user.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post comment');
      }

      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');

      toast({
        title: 'Success',
        description: 'Comment posted successfully!',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post comment.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    setDeletingComment(commentId);
    try {
      const response = await fetch(`/api/posts/${params.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      setComments(comments.filter(comment => comment._id !== commentId));
      toast({
        title: 'Success',
        description: 'Comment deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete comment.',
        variant: 'destructive',
      });
    } finally {
      setDeletingComment(null);
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

  if (!post || !user) return null;

  const isLiked = post.likes?.includes(user.uid);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <article className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-muted-foreground mt-2">
              Posted on {format(new Date(post.createdAt), 'PPP')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes?.length || 0}
          </Button>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content}
        </div>

        <div className="border-t pt-6 space-y-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Comments</h2>
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="" alt={comment.author} />
                  <AvatarFallback>
                    {comment.author.split('@')[0].slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), 'PPP')}
                      </p>
                    </div>
                    {user?.email === comment.author && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingComment === comment._id}
                          >
                            {deletingComment === comment._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
} 