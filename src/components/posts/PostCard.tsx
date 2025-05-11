import Link from "next/link";
import { PostMeta } from "./PostMeta";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    author: string;
    publishedAt: string;
    published?: boolean;
  };
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  return (
    <article className={cn("group relative flex flex-col space-y-2", className)}>
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h2>
      </Link>
      <PostMeta author={post.author} publishedAt={post.publishedAt} />
      {post.excerpt && (
        <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
      )}
      <Link
        href={`/posts/${post.slug}`}
        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        Read more
        <span className="ml-1">→</span>
      </Link>
    </article>
  );
} 