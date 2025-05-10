'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreatePostForm from '@/components/posts/CreatePostForm';

export default function CreatePostPage() {
  const router = useRouter();

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground mt-2">
            Share your thoughts with the community
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <CreatePostForm />
        </div>
      </div>
    </div>
  );
} 