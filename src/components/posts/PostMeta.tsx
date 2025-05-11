import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostMetaProps {
  author: string;
  publishedAt: string;
  className?: string;
}

export function PostMeta({ author, publishedAt, className }: PostMetaProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>By {author}</span>
      <span>•</span>
      <time dateTime={publishedAt}>
        {format(new Date(publishedAt), "MMMM d, yyyy")}
      </time>
    </div>
  );
} 