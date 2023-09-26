import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { socketIOPostObject } from '@socket/post';


/* 
postCache: creating an instance of PostCache
socketIOPostObject.emit: emitting/notification an event and postId to our client
postCache.deletePostFromCache(): deleting a post from cache with args required by our cache method in
postQueue.addPostJob: deletes the post from the db
('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId }): JOB NAME, PARAMS

*/
const postCache: PostCache = new PostCache();

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    socketIOPostObject.emit('delete post', req.params.postId);
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);
    postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
