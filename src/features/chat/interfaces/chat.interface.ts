import mongoose, { Document } from 'mongoose';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IReaction } from '@reaction/interfaces/reaction.interface';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderUsername: string;
  senderAvatarColor: string;
  senderProfilePicture: string;
  receiverUsername: string;
  receiverAvatarColor: string;
  receiverProfilePicture: string;
  body: string;
  gifUrl: string;
  isRead: boolean;
  selectedImage: string;
  reaction: IReaction[];
  createdAt: Date;
  deleteForMe: boolean;
  deleteForEveryone: boolean;
}

export interface IMessageData {
  _id: string | mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  receiverId: string;
  receiverUsername: string;
  receiverAvatarColor: string;
  receiverProfilePicture: string;
  senderUsername: string;
  senderId: string;
  senderAvatarColor: string;
  senderProfilePicture: string;
  body: string;
  isRead: boolean;
  gifUrl: string;
  selectedImage: string;
  reaction: IReaction[];
  createdAt: Date | string;
  deleteForMe: boolean;
  deleteForEveryone: boolean;
}

export interface IMessageNotification {
  currentUser: AuthPayload;
  message: string;
  receiverName: string;
  receiverId: string;
  messageData: IMessageData;
}

/*
When a user is chatting with another, their IDs is being saved in a list and when one of the user
clicks on another user to chat with the list is being updated with the new user id being chatted with
*/
export interface IChatUsers {
  userOne: string;
  userTwo: string;
}

/*
this is used for the chat list page (i.e all conversations started)
*/
export interface IChatList {
  receiverId: string;
  conversationId: string;
}

export interface ITyping {
  sender: string;
  receiver: string;
}

/* for sending data to the chat queue */
export interface IChatJobData {
  senderId?: mongoose.Types.ObjectId | string;
  receiverId?: mongoose.Types.ObjectId | string;
  messageId?: mongoose.Types.ObjectId | string;
  senderName?: string;
  reaction?: string;
  type?: string;
}

export interface ISenderReceiver {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
}

export interface IGetMessageFromCache {
  index: number;
  message: string;
  receiver: IChatList;
}
