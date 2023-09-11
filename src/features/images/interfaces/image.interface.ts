import mongoose from 'mongoose';

/*
imgId: profile picture
bgImageId: profile background image
*/
export interface IFileImageDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  bgImageVersion: string;
  bgImageId: string;
  imgId: string;
  imgVersion: string;
  createdAt: Date;
}

export interface IFileImageJobData {
  key?: string;
  value?: string;
  imgId?: string;
  imgVersion?: string;
  userId?: string;
  imageId?: string;
}

/*
IBgUploadResponse: for response gotten when an image is uploaded to cloudinary
*/
export interface IBgUploadResponse {
  version: string;
  publicId: string;
  public_id?: string;
}
