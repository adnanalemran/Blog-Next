import Link from "next/link";
import { PostMeta } from "./PostMeta";
import { cn } from "@/lib/utils";

function formatUsername(email: string): string {
  // Remove domain and special characters, capitalize first letter
  const username = email.split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^\w/, c => c.toUpperCase());
  return username;
}

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    author: string;
    publishedAt?: string;
    createdAt: string;
    published?: boolean;
  };
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  return (
    <article className={cn("group relative flex flex-col space-y-2", className)}>
      <Link href={`/posts/${post._id}`}>
        <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h2>
      </Link>
      <PostMeta 
        author={post.author} 
        publishedAt={post.publishedAt || post.createdAt} 
      />
      <p className="text-muted-foreground line-clamp-2">{post.content}</p>
      <Link
        href={`/posts/${post._id}`}
        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        Read more
        <span className="ml-1">→</span>
      </Link>
    </article>
  );
} 