import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

/*
ICommentDocument: a single comment data
?: means it's optional
userTo: id of the user that created the post
ICommentJob: data added to the queue
ICommentNameList: data for all the names of users who commented on a post
IQueryComment, IQuerySort: data used to query the DB
*/
export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createdAt?: Date;
  userTo?: string | ObjectId;
}

export interface ICommentJob {
  postId: string;
  userTo: string;
  userFrom: string;
  username: string;
  comment: ICommentDocument;
}

export interface ICommentNameList {
  count: number;
  names: string[];
}

export interface IQueryComment {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IQuerySort {
  createdAt?: number;
}
