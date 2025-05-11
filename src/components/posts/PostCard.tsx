import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from "lucide-react";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    likes: string[];
    comments?: string[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="w-full   transition-shadow duration-200">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-bold line-clamp-2 hover:text-primary transition-colors">
          {post.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">
          {post.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>
        <Link href={`/posts/${post._id}`}>
          <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 