import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@auth/user/interfaces/user.interface';
//import { IUserDocument } from '@user/interfaces/user.interface';

/*
?: means optional
declare global currentUser : we are creating our own custom express namespace request property. It will hold the properties of the a auth user
AuthPayload: data type of our currentUser property
IAuthDocument: user document schema for mongoDB
ISignUpData: props data types supplied during sign up
*/

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  username: string;
  password: string;
  avatarColor: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
