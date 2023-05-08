import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import {
  ICommentDocument,
  ICommentNameList,
} from '@comment/interfaces/comment.interface';

const log: Logger = config.createLogger('commentsCache');

export class CommentCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }

  /*
  commentsCache: cache name
  savePostCommentToCache: this saves a comment to cache
  LPUSH(`comments:${postId}`, value): creates a comment collection with postId as key, with value saved in it
  HMGET(`posts:${postId}`: fetches a single field (commentsCount) from the posts colletion, to know the number of comments made to a post
  parseJson(commentsCount[0]): parsing the string commentsCount[] as number, and we're getting the data at index 0 cus it's being returned as a string
  count += 1: incrementing the comment count by 1
  */
  public async savePostCommentToCache(
    postId: string,
    value: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${postId}`, value);
      const commentsCount: string[] = await this.client.HMGET(
        `posts:${postId}`,
        'commentsCount'
      );
      let count: number = Helpers.parseJson(commentsCount[0]) as number;
      count += 1;
      //const dataToSave: string[] = ['commentsCount', `${count}`];
      await this.client.HSET(
        `posts:${postId}`,
        'commentsCount',
        JSON.stringify(count)
      );
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }


  /*
  getCommentsFromCache: used to fetch comments from cache
  reply = LRANGE(`comments:${postId}`): retrieves all the comments[] of a post from the cache
  0,-1: start value, end value. This fetches all items in the list
  for (const item of reply): looping through the list to get each item, which is then parsed back to ICommentDocument type from string
  */
  public async getCommentsFromCache(
    postId: string
  ): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }


  /*
  getCommentsNamesFromCache: gets the usernames of those who commented on a post
  commentsCount: total number comments on a post
  comments: all comments made to a post
  for (const item of comments): looping through the comment hash
  list.push(comment.username): gets the username prop in a particular comment and adds/push into the empty list
  response: object holding the total number of comments and names of those who commented
   */
  public async getCommentsNamesFromCache(
    postId: string
  ): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const commentsCount: number = await this.client.LLEN(
        `comments:${postId}`
      );
      const comments: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: string[] = [];
      for (const item of comments) {
        const comment: ICommentDocument = Helpers.parseJson(
          item
        ) as ICommentDocument;
        list.push(comment.username);
      }
      const response: ICommentNameList = {
        count: commentsCount,
        names: list,
      };
      return [response];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }


  /*
  getSingleCommentFromCache: this gets a single comment document from the cache using postId and commentId
  comments: all comments fetched based on postId
  for (const item of comments): looping through the comment, parse them to ICommentDocument and add them to an empty list
  result: finds the commentId prop (_id) in the result list which matches with the commentId passed into the getSingleCommentFromCache()
  */
  public async getSingleCommentFromCache(
    postId: string,
    commentId: string
  ): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const comments: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: ICommentDocument[] = [];
      for (const item of comments) {
        list.push(Helpers.parseJson(item));
      }
      const result: ICommentDocument = find(
        list,
        (listItem: ICommentDocument) => {
          return listItem._id === commentId;
        }
      ) as ICommentDocument;

      return [result];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
