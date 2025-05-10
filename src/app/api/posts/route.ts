import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, author } = await request.json();
    console.log('Received post data:', { title, content, author });

    if (!title || !content || !author) {
      console.error('Missing required fields:', { title, content, author });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Create the post with the author's Firebase UID
    const post = await Post.create({
      title,
      content,
      author,
      likes: [],
      comments: [],
    });

    console.log('Created post:', post);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 