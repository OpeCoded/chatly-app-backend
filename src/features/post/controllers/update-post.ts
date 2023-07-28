import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { socketIOPostObject } from '@socket/post';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import {
  postSchema,
  postWithImageSchema,
  postWithVideoSchema,
} from '@post/schemes/post.schemes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { imageQueue } from '@service/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async posts(req: Request, res: Response): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion,
      videoId: '',
      videoVersion: '',
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  /*
    postWithImage: checks if a user is updating an existing post with that has image
    (imgId && imgVersion): means the post already has an image... Handled by updatePostWithImage() ELSE the user is uploading an image to a post that doesn't have an image before... Handled by addImageToExistingPost()
    const result: uploads a new image for a post
    const postUpdated: the update post

  */
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse =
        await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Post with image updated successfully' });
  }


  /* 
  (videoId && videoVersion): if exist, means the user is still using the same media that was uploaded before, else the user is adding a new media 

  */
  @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    const { videoId, videoVersion } = req.body;
    if (videoId && videoVersion) {
      Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse =
        await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Post with video updated successfully' });
  }


  /* 
  updatePost(): used to update a post 
  imgId: imgId ? imgId : '': checking if the value is available, esle set to empty
  */
  private async updatePost(req: Request): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
      videoId,
      videoVersion,
    } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : '',
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  }

  /* 
  this is used to upload a new media (video or image) to an existing post
  result: if image is available it uses the uploads() to upload image, else it's a video that was sent hence uses the videoUpload()
  (!result?.public_id): if no upload was made, code break i.e return 
  if (image): if it's image, add to DB
   */
  private async addImageToExistingPost(
    req: Request
  ): Promise<UploadApiResponse> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      image,
      video,
    } = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse = image
      ? ((await uploads(image)) as UploadApiResponse)
      : ((await videoUpload(video)) as UploadApiResponse);
    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : '',
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    if (image) {
      imageQueue.addImageJob('addImageToDB', {
        key: `${req.currentUser!.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString(),
      });
    }
    return result;
  }
}
