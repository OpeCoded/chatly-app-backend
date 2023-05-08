import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { remove } from 'lodash';
import mongoose from 'mongoose';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('followersCache');
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  /*
  saveFollowerToCache: saves the user id of a user who wants to follow another user in the cache
  LPUSH: saves the value into a list
  */
  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  removeFollowerFromCache: this removes the id of user following another user from the collection in the cache
  LREM: removes an item from a list in the cache
  (key, 1, value): KEY, NO OF ITEM TO REMOVE, VALUE

   */

  public async removeFollowerFromCache(
    key: string,
    value: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  updateFollowersCountInCache: updates the followersCount and followingCount of the USERS: KEY in the cache
  prop: name of the field we want to update (i.e followersCount, followingCount)
  HINCRBY: increments a value
  */
  public async updateFollowersCountInCache(
    userId: string,
    prop: string,
    value: number
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    getFollowersFromCache: gets all the followers and followings of a user
    LRANGE: used to get data from a list
    (key, 0, -1): retrieves all items in the followers: #userId {...}
    for (const item of response): looping through the list
    userCache.getUserFromCache(item): getting each items fields/props from the cache using the itemIds in the {...}
    data: fileds we need
    list.push(data): adding each data of a user to the empty list we created above

  */

  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const list: IFollowerData[] = [];
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(
          item
        )) as IUserDocument;
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user,
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  updateBlockedUserPropInCache: used to block and unblock a user
  key: user #hash in cache
  prop: blocked / blockedBy field
  type: block / unblock. data to be processed must be one of the two only
  response: fetching a user blocked/blockeBy field using it's hash
  blocked: casting the response back to an array
  if (type === 'block'): if a user is blocking a user, then we spread the existing items in the blocked list and add the new value (user id) to be blocked
  remove(blocked, (id: string): else the user is trying to unblock a user so remove the user's id from the blocked[]
  => id === value: where any id in the blocked[] matches value (the user id that was passed into the method)
  multi.HSET: updating the users collection with the updated fields
  
  */
  public async updateBlockedUserPropInCache(
    key: string,
    prop: string,
    value: string,
    type: 'block' | 'unblock'
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string = (await this.client.HGET(
        `users:${key}`,
        prop
      )) as string;
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      let blocked: string[] = Helpers.parseJson(response) as string[];
      if (type === 'block') {
        blocked = [...blocked, value];
      } else {
        remove(blocked, (id: string) => id === value);
        blocked = [...blocked];
      }
      //const dataToSave: string[] = [`${prop}`, JSON.stringify(blocked)];
      multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
