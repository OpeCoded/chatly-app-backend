import { Job, DoneCallback } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { postService } from '@service/db/post.service';


/*
savePostToDB: this worker will get the post data from the queue and send it to a post service method which will add the post to the database
*/
const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  /*
  deletePostFromDB: gets params required to delete a post from the db from post.service.ts deletePost()
  { keyOne, keyTwo }: postId, userId coming from postService.deletePost()
  */
  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }


  /*
{ key, value }: postId, updatedPost coming from post.service.ts editPost() args
  */
  async updatePostInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.editPost(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
