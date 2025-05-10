import mongoose from 'mongoose';

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  likes: string[];
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this post.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide content for this post.'],
  },
  author: {
    type: String,
    required: true,
    index: true,
  },
  likes: [{
    type: String,
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure indexes
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema); 