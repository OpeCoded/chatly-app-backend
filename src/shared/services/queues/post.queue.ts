import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { postWorker } from '@worker/post.worker';

/*
addPostToDB: name of job that adds a post to the db
savePostToDB: method to save post to db
*/
class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
    this.processJob('deletePostFromDB', 5, postWorker.deletePostFromDB);
    this.processJob('updatePostInDB', 5, postWorker.updatePostInDB);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
