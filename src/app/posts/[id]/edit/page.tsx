'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Trash2, Calendar, User, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/models/Post';
import { format } from 'date-fns';
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

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
        setTitle(data.title || '');
        setContent(data.content || '');
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post.',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          authorId: post?.author,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      
      toast({
        title: 'Success',
        description: 'Post updated successfully.',
      });
      
      router.push(`/posts/${params.id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update post.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: post?.author,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
      }

      toast({
        title: 'Success',
        description: 'Post deleted successfully.',
      });
      
      router.push('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete post.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    setLiking(true);
    try {
      const userId = post.author; // Using author ID for demo, replace with actual user ID
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isLiked = post.likes?.includes(post.author); // Using author ID for demo, replace with actual user ID

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <p className="text-muted-foreground mt-2">
              Make changes to your post
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              disabled={liking}
              className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes?.length || 0} Likes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Author ID: {post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {format(new Date(post.createdAt), 'PPP')}</span>
          </div>
          {post.updatedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {format(new Date(post.updatedAt), 'PPP')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="min-h-[200px] resize-y"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 