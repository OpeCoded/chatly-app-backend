import mongoose, { model, Model, Schema } from 'mongoose';
import { ICommentDocument } from '@comment/interfaces/comment.interface';

/*
commentSchema: schema name
Comment: name of the collection that will be created in the DB
ref: 'Post': reference collection
*/
const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avataColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() }
});

const CommentsModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
export { CommentsModel };
