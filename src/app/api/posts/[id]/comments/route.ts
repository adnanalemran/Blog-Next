import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import connectDB from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const { content, author } = await request.json();

    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      content,
      author,
      postId,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 