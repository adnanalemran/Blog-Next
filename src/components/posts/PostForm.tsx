import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PostFormData {
  title: string;
  slug: string;
  excerpt?: string;
  author: string;
  publishedAt?: string;
  published?: boolean;
}

interface PostFormProps {
  initialData: PostFormData | null;
  onSubmit: (data: PostFormData) => void;
  children?: ReactNode;
}

export function PostForm({ initialData, onSubmit, children }: PostFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PostFormData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      author: formData.get("author") as string,
      publishedAt: formData.get("publishedAt") as string || new Date().toISOString(),
      published: formData.get("published") === "on",
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={initialData?.slug}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author Name</Label>
          <Input
            id="author"
            name="author"
            defaultValue={initialData?.author}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Publish Date</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Input
            id="excerpt"
            name="excerpt"
            defaultValue={initialData?.excerpt}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            defaultChecked={initialData?.published}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>
      {children}
      <Button type="submit">Save Post</Button>
    </form>
  );
} 