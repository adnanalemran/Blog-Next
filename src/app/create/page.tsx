import  CreatePostForm  from '@/components/posts/CreatePostForm';

export default function CreatePost() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <CreatePostForm />
    </div>
  );
} 