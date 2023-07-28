import mongoose, { Document } from 'mongoose';

/*
insertNotification: method used to insert a new notification
userTo: id of user a notificatoin is being sent to
userFrom: id of user sending a notification
notificationType: comments, reactions, new follower, DM etc
entityId: main entity id i.e under which section a notification is been sent for 
createdItemId: notificationType id (comments, reactions, new follower, DM etc)
insertNotification(): method used to send a notification
read: if read/unread
*/
export interface INotificationDocument extends Document {
  _id?: mongoose.Types.ObjectId | string;
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: mongoose.Types.ObjectId;
  createdItemId: mongoose.Types.ObjectId;
  comment: string;
  reaction: string;
  post: string;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
  read?: boolean;
  createdAt?: Date;
  insertNotification(data: INotification): Promise<void>;
}

export interface INotification {
  userTo: string;
  userFrom: string;
  message: string;
  notificationType: string;
  entityId: mongoose.Types.ObjectId;
  createdItemId: mongoose.Types.ObjectId;
  createdAt: Date;
  comment: string;
  reaction: string;
  post: string;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
}

export interface INotificationJobData {
  key?: string;
}

export interface INotificationTemplate {
  username: string;
  message: string;
  header: string;
}
