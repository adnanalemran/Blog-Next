'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Post } from '@/models/Post';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const router = useRouter();
  const { toast } = useToast();

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
    if (!post) return;
    
    setLiking(true);
    try {
      const userId = 'demo-user-123'; // Using demo user ID
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
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          author: 'demo-user-123', // Using demo user ID
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

  const isLiked = post.likes?.includes('demo-user-123');

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
              <div key={comment._id} className="flex gap-4">
                <Avatar>
                  <AvatarFallback>
                    {comment.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'PPP')}
                    </span>
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