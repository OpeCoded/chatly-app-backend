import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addImageSchema } from '@image/schemes/images';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@socket/image';
import { imageQueue } from '@service/queues/image.queue';
import { IBgUploadResponse } from '@image/interfaces/image.interface';
import { Helpers } from '@global/helpers/helpers';

const userCache: UserCache = new UserCache();


/*
profileImage: used to add/upload profile image
uploads: our method to upload image to cloudinary
!result?.public_id: checks if a public id (we used our userObjectId for it) was returned (i.e upload was successful)
url: custom url for the image uploaded
cachedUser: updating the profilePicture prop in our user hash (KEY, PROP, VALUE)
socketIOImageObject: sending the returned or immediate updated user back to the client
imageQueue.addImageJob(): exec the add image job in the queue
*/
export class Add {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.');
    }
    const url = `https://res.cloudinary.com/dlml4ol3c/image/upload/v${result.version}/${result.public_id}`;
    const cachedUser: IUserDocument = (await userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'profilePicture',
      url
    )) as IUserDocument;
    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('addUserProfileImageToDB', {
      key: `${req.currentUser!.userId}`,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }


  /*
  This methods is used to upload background image
  { version, publicId }: destructuring values returned by the backgroundUpload()
  bgImageId i.e publicId: updates the prop bgImageId in the currently logged in user's hash using the values gotten above (publicId)
  bgImageVersion i.e bgImageVersion: updates the prop bgImageVersion in the currently logged in user's hash using the values gotten above (version)
  socketIOImageObject.emit: sending some values on the client side
  imageQueue.addImageJob: this saves the uploaded image id and version to the Image colllection in the DB
  */
  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse = await Add.prototype.backgroundUpload(req.body.image);
    const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageId',
      publicId
    ) as Promise<IUserDocument>;
    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageVersion',
      version
    ) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];
    socketIOImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0]
    });
    imageQueue.addImageJob('updateBGImageInDB', {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: version.toString()
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }


  /*
  This methods checks if a user a uploading a new background image or wants to use an existing image
  isDataURL: checks if the image uploaded is base64
  if (isDataURL): if true i.e a base64 image string, so it's a new image to be uploaded
  Note that cloudinary will generate the public id
  result: uploads the image to cloudinary
  if (!result.public_id): if now public_id was returned i.e image failed to upload

  value: splits the image url into a list by removing all the slashes (/) in it to retrieve the vesion number and the publicId of the image uploaded which are the last two props in the url
  version: getting the value at postion 2nd to the last in the list
  publicId: getting the last value in the list
  version.replace: this replaces the letter 'v' in v4746728483 with empty string

  */
  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image);
    let version = '';
    let publicId = '';
    if (isDataURL) {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      const value = image.split('/');
      version = value[value.length - 2];
      publicId = value[value.length - 1];
    }
    return { version: version.replace(/v/g, ''), publicId };
  }
}
