import { notFound } from "next/navigation";
import { PostContent } from "@/components/posts/PostContent";
import { PostMeta } from "@/components/posts/PostMeta";

async function getPost(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }

  return res.json();
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post;
  try {
    post = await getPost(params.slug);
  } catch (error) {
    notFound();
  }

  return (
    <article className="container py-6 max-w-3xl mx-auto">
      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <PostMeta author={post.author} publishedAt={post.publishedAt} className="text-base" />
        {post.excerpt && (
          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
        )}
      </header>
      <PostContent content={post.content} />
    </article>
  );
} 