import { format } from "date-fns";
import { cn } from "@/lib/utils";

function formatUsername(email: string): string {
  // Remove domain and special characters, capitalize first letter
  const username = email.split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^\w/, c => c.toUpperCase());
  return username;
}

interface PostMetaProps {
  author: string;
  publishedAt: string;
  className?: string;
}

export function PostMeta({ author, publishedAt, className }: PostMetaProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>By {formatUsername(author)}</span>
      <span>•</span>
      <time dateTime={publishedAt}>
        {format(new Date(publishedAt), "MMMM d, yyyy")}
      </time>
    </div>
  );
} 