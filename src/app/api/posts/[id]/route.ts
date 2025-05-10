import { NextResponse } from 'next/server';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const { title, content, authorId } = await request.json();

    // Check if the author ID matches
    if (post.author !== authorId) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this post' },
        { status: 403 }
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        title: title || post.title,
        content: content || post.content,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    let updatedLikes = [...(post.likes || [])];

    if (action === 'like') {
      if (!updatedLikes.includes(userId)) {
        updatedLikes.push(userId);
      }
    } else if (action === 'unlike') {
      updatedLikes = updatedLikes.filter(id => id !== userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { likes: updatedLikes },
      { new: true }
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { error: 'Failed to update likes' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postId = params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const { authorId } = await request.json();

    // Check if the author ID matches
    if (post.author !== authorId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this post' },
        { status: 403 }
      );
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 