import { IUserDocument } from '@auth/user/interfaces/user.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

/*
This file represents our table/collection for user

authId: this is the ref created for all user (i.e it holds the fields marked optional with ? in user.interface.ts)
('User', userSchema, 'User') => ('Collection Name', Schema Name, 'Collection Name')
*/
const userSchema: Schema = new Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
  profilePicture: { type: String, default: '' },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  work: { type: String, default: '' },
  school: { type: String, default: '' },
  location: { type: String, default: '' },
  quote: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' },
});

const UserModel: Model<IUserDocument> = mongoose.models.User || model<IUserDocument>(
  'User',
  userSchema,
  'User'
);
export { UserModel };
