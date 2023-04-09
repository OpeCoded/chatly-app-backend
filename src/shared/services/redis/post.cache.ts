import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import {
  ISavePostToCache,
  IPostDocument,
} from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { IReactions } from '@reaction/interfaces/reaction.interface';


/*
For ref: check user.cache.ts
Note: for the PostCache class, we're not creating it's instance immeidately here like we've always be doing. It's better to create the instance of classes right inside the controller in which we want to use them.
dataToSave: object containing field: value data to be saved to the post cache
savePostToCache: saves a post to the cache
Inside the try block, after this.client.connect(): we're adding data to the cache
postCount: string[]: getting the current number of posts the user have posted from cache
 */

const log: Logger = config.createLogger('postCache');

export type PostCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply[]
  | IPostDocument
  | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt,
    } = createdPost;

    const dataToSave = {
      _id: `${_id}`,
      userId: `${userId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      profilePicture: `${profilePicture}`,
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      commentsCount: `${commentsCount}`,
      reactions: JSON.stringify(reactions),
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
      createdAt: `${createdAt}`,
    };

    /*
(`users:${currentUserId}`, 'postsCount'): KEY:VALUE, FIELD to get value from
ReturnType<typeof this.client.multi >: improvising a return TYPE, so the return type of var multi will be whatever the this.client.multi returns.
client.multi(): used to create redis multiple commands and execute them at once
multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`): saves a post as hash to redis. {key} is the postId
client.ZADD: saving post as a set. Which can then be retrieved based key(score)
parseInt(postCount[0], 10) + 1: incrementing the post count once a new post is being added
Object.entries(dataToSave): looping through the dataToSave{} to get each field and key to save
(`users:${currentUserId}`, 'postsCount', count): updating the postcount of a user after a new post is being created
multi.HSET(`users:${currentUserId}`, 'postsCount', count): saving the value of post count to the user hash i.e user key in the cache, 'KEY', VALUE
multi.exec(): executes all the multi. commands written above in this method
      */

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        'postsCount'
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      await this.client.ZADD('post', {
        score: parseInt(uId, 10),
        value: `${key}`,
      });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, 'postsCount', count);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  GETTING MULTIPLE PROPS OR HASHES IN REDIS
  getPostsFromCache: used to get all posts (sorted sets) from the redis cache using ZRANGE
  ZRANGE: returns all values within the start and end valies
  start, end: to set the values to be returned by ZRANGE, and also for pagination
  client.connect(): connecting to redis client
  reply: posts ID results after using ZRANGE
  REV: Means reverse order, it returns the latest posts first
  PostCacheMultiType: range of type our replies can be
  HGETALL: gets all prop for a particular post hash #
  (const value of reply): looping through the returned posts IDs fetched by ZRANGE
  posts:${value}: KEY {VALUE i.e id}
  replies: holds each posts properties
  (const post of replies as IPostDocument[]): looping through each posts  and then convert posts props commentsCount, createdAt, reactions to json
  postReplies: holds all posts fectched from redis and its properties as a list
  push(post): adds each post fetched after a loop to postReplies[]
  */
  public async getPostsFromCache(
    key: string,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, {
        REV: true,
      });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(
          `${post.commentsCount}`
        ) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(
          Helpers.parseJson(`${post.createdAt}`)
        ) as Date;
        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  getTotalPostsInCache: get the total number of post in the sorted set in our redis cache
  ZCARD('post'): returns the number of items in our post key in the cache

  */
  public async getTotalPostsInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  getPostsWithImagesFromCache: gets all posts with images inside the cache
  (post.imgId && post.imgVersion) || post.gifUrl): conditionally pushing posts with image/media to the postWithImages[] i.e results/replies
  */
  public async getPostsWithImagesFromCache(
    key: string,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, {
        REV: true,
      });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postWithImages: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(
            `${post.commentsCount}`
          ) as number;
          post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(
            Helpers.parseJson(`${post.createdAt}`)
          ) as Date;
          postWithImages.push(post);
        }
      }
      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    getUserPostsFromCache: this gets a post by a particuular user
    ZRANGE: the user uId is used as the start and end
    REV: true,BY: 'SCORE': post is returned in a reversed and sorted by score manner
  */
  public async getUserPostsFromCache(
    key: string,
    uId: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, uId, uId, {
        REV: true,
        BY: 'SCORE',
      });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(
          `${post.commentsCount}`
        ) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(
          Helpers.parseJson(`${post.createdAt}`)
        ) as Date;
        postReplies.push(post);
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  getTotalUserPostsInCache: this gets the total count of post made by a particular user
  ZCOUNT('post', uId, uId): min and max value is the uId of the user
   */
  public async getTotalUserPostsInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  deletePostFromCache: deletes a post from the post set and it's hash in redis
  postCount: the number of posts made by a user i.e userId(score)
  HMGET: gets an item from a set
  ZREM: removes an item from a set
  ZREM('post', `${key}`): deletes a post from sorted set
  ${key}: VALUE/hash of the sorted set to delete e.g 63c523818f5ebdbbb1fd3747 or #63c523818f5ebdbbb1fd3747 which is the post id
  DEL(`posts:${key}`): deletes a post from the hash
  const count: decrements the post count of the user
   multi.HSET(`users:${currentUserId}`: updating back the post count of the user
   multi.exec(): executes all multi method/commands at the same time
  */

  public async deletePostFromCache(
    key: string,
    currentUserId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        'postsCount'
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      const count: number = parseInt(postCount[0], 10) - 1;
      multi.HSET(`users:${currentUserId}`, 'postsCount', count);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    updatePostInCache: updates a post in cache
    updatedPost: destructuring values of an existing post so that even if the user didn't change anything we just return the same existing values
    firstList, secondList: post props splitted into two just for simplicity in code
    dataToSave: new post value to save
    HSET(`posts:${key}`, dataToSave): updating a post hash based on the hash key
    multi.HGETALL(`posts:${key}`): getting the last updated post based on hash key value
    reply: execute all our redis commands at the same time
    postReply: response gotten after executing multi.exec()
    postReply[0]: since reply is of type IPostDocument[], only one item (post) will be in the list so the post we're updating is the first one in the list at index 0
    postReply[0].commentsCount: converting post props to int since they're coming as strings
    return postReply[0]: returning the updated hash
   */
  public async updatePostInCache(
    key: string,
    updatedPost: IPostDocument
  ): Promise<IPostDocument> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = updatedPost;

    const dataToSave = {
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      profilePicture: `${profilePicture}`,
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      const reply: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postReply = reply as IPostDocument[];
      postReply[0].commentsCount = Helpers.parseJson(
        `${postReply[0].commentsCount}`
      ) as number;
      postReply[0].reactions = Helpers.parseJson(
        `${postReply[0].reactions}`
      ) as IReactions;
      postReply[0].createdAt = new Date(
        Helpers.parseJson(`${postReply[0].createdAt}`)
      ) as Date;

      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
