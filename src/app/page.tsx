import { Button } from "@/components/ui/button";
import PostCard from "@/components/posts/PostCard";
import Link from "next/link";
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { PlusCircle } from "lucide-react";

interface PostType {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: string[];
  comments?: string[];
}

async function getPosts(): Promise<PostType[]> {
  try {
    await connectDB();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean<PostType[]>();
    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes,
      comments: post.comments,
    })) as PostType[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-8">
       
          <div className="flex justify-end">
            <Link href="/posts/new">
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Create Post
              </Button>
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id.toString()} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your thoughts with the community
              </p>
              <Link href="/posts/new">
                <Button size="lg" className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Create Your First Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
