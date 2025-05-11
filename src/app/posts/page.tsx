import { PostCard } from "@/components/posts/PostCard";

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function PostsPage() {
  const { posts } = await getPosts();

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
} 