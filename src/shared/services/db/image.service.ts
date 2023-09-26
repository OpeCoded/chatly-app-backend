import { IFileImageDocument } from '@image/interfaces/image.interface';
import { ImageModel } from '@image/models/image.schema';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class ImageService {
  /*
  addUserProfileImageToDB: this creates a doc in the Image collection and the update the profileImage prop in the User collection doc
  _id: id of the user to be updated in the User collection
  { profilePicture: url }: prop to be updated: value
  addImage: this creates a new image doc in the Image collection
  */
  public async addUserProfileImageToDB(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
    await this.addImage(userId, imgId, imgVersion, 'profile');
  }

  public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  /*
  addImage: this creates a new image doc (of specific type i.e profile/background image) in the Image collection
  */
  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      /* dynamically setting the right imgVersion to differentiate profile (imgVersion, imgId) from background */
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }

  /* this deletes a doc from the Image collection using the imageId */
  public async removeImageFromDB(imageId: string): Promise<void> {
    await ImageModel.deleteOne({ _id: imageId }).exec();
  }

  /*
  this method is used to get backgroundImage added by the user using the bgImageId
  */
  public async getImageByBackgroundId(bgImageId: string): Promise<IFileImageDocument> {
    const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
    return image;
  }


  /*
  getImages: gets all images added by a user
  $match: matches all the docs in the Image collection where the userId matches
  */
  public async getImages(userId: string): Promise<IFileImageDocument[]> {
    const images: IFileImageDocument[] = await ImageModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
    return images;
  }
}

export const imageService: ImageService = new ImageService();
