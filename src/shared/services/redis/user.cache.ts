import { BaseCache } from '@service/redis/base.cache';
import {
  INotificationSettings,
  ISocialLinks,
  IUserDocument,
} from '@auth/user/interfaces/user.interface';
import Logger from 'bunyan';
import { indexOf, findIndex } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';

/*
userCache: our cache name
saveUserToCache: this saves users frequently accessed data to the redis cache (cacheName: userCache)
Note, we're saving user's data as a set
ZADD enables us to retrive all properties at a go in a set based on a key e.g id

const {..}  = createdUser: destructuring props from IUserDocument
BREAKING VALUES INTO SMALL CHUNKS BECAUSE IT'S A LONG LIST
firstList: string[]: saving user text based data in to arrays, with key value pairs
secondList: string[]: saving user object based data in to arrays, with key value pairs and then convert them to string
thirdList: string[]: saving user text based data in to arrays, with key value pairs

dataToSave: spreading the actual list (firstList - thirdList) of data to save to redis cache
if (!this.client.isOpen): checks if the redis connection is still open, if not establish a new connection. A MUST

client.ZADD: this adds a new set (user) to the cache
('user', { score: parseInt(userUId, 10), value: `${key}` }): key, value
score: allows us to retrieve all items in a set using the score key value i.e userId we generated ourself
parseInt(userUId, 10): converts user id to int and base10
value: `${key}`: is

client.HSET: saves the actual user data to the cache
(`users:${key}`, dataToSave): key, value


this.client.HGETALL: getting a user from cache using it's user id
users:${userId}: KEY: USER_ID in cache
Helpers.parseJson: our helper method to convert stringified props to json

y
UserItem: interface or datatype for item to be update in the user cache using the method updateSingleUserItemInCache()
*/
const log: Logger = config.createLogger('userCache');
type UserItem = string | ISocialLinks | INotificationSettings;
type UserCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply[]
  | IUserDocument
  | IUserDocument[];

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const dataToSave = {
      '_id': `${_id}`,
      'uId': `${uId}`,
      'username': `${username}`,
      'email': `${email}`,
      'avatarColor': `${avatarColor}`,
      'createdAt': `${createdAt}`,
      'postsCount': `${postsCount}`,
      'blocked': JSON.stringify(blocked),
      'blockedBy': JSON.stringify(blockedBy),
      'profilePicture': `${profilePicture}`,
      'followersCount': `${followersCount}`,
      'followingCount': `${followingCount}`,
      'notifications': JSON.stringify(notifications),
      'social': JSON.stringify(social),
      'work': `${work}`,
      'location': `${location}`,
      'school': `${school}`,
      'quote': `${quote}`,
      'bgImageVersion': `${bgImageVersion}`,
      'bgImageId': `${bgImageId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(
        `users:${userId}`
      )) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(`${response.social}`);
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);
      response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
      response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);
      response.work = Helpers.parseJson(`${response.work}`);
      response.school = Helpers.parseJson(`${response.school}`);
      response.location = Helpers.parseJson(`${response.location}`);
      response.quote = Helpers.parseJson(`${response.quote}`);

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  getUsersFromCache: this method is used to fetch multiple users from the cache
  start, end: used for pagination
  excludedUserKey: logged in user to exclude (i.e currently logged in user isn't expectd to see his/herself in the list of users fetched)
  ZRANGE: for pagination. Note that we can only get one user hash from the key at a time
  response: gets user from the 'user' key/collection in the cache
  HGETALL: helps us to get/fetch all the hash instead of one
  (const key of response): looping through the response
  key !== excludedUserKey: ensures a key in the response isn't the currently logged in user key, then get all users data/info based on the key
  UserCacheMultiType: our defined Type for multi.exec()
  replies: results returned after getting all users
  (const reply of replies as IUserDocument[]): looping through all the users to get individual data in the reply
  push(reply): adding each reply (user) into the empty list userReplies
  */
  public async getUsersFromCache(
    start: number,
    end: number,
    excludedUserKey: string
  ): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.ZRANGE('user', start, end, {
        REV: true,
      });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const key of response) {
        if (key !== excludedUserKey) {
          multi.HGETALL(`users:${key}`);
        }
      }
      const replies: UserCacheMultiType =
        (await multi.exec()) as UserCacheMultiType;
      const userReplies: IUserDocument[] = [];
      for (const reply of replies as IUserDocument[]) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);

        userReplies.push(reply);
      }
      return userReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  this method gets random users from the cache
  userId: currently logged in user
  excludedUsername: excludes currrently logged in user in the random list
  replies: list to hold random users
  followers: followers of the currently logged in user, so as to determin wether to show follow button
  users: gets all the user in the cache
  randomUsers: list of shuffled users by the help of shuffle() in our helpers.ts
  slice(): returns the first 11 items in the list
  (const key of randomUsers): loops through the randomUsers and
  indexOf(followers, key): (FOLLOWERS LIST, KEY) checks if any of the randomly selected users is part of the followers
  (followerIndex < 0): means the particular follower isn't a follower of the logged in user. so if true,
  userHash: fetch the user info from the users hash in the cache based on the key passed in 
  as unknown as IUserDocument: changes the TYPE and sets to the actual TYPE we want
  replies.push(): adds the user's hash the list of random users to be displayed
  excludedUsernameIndex: the index (currently logged in user) we want to remove from replies []
  findIndex(replies, ['username',excludedUsername,]): (LIST WE ARE FINDING FROM, ['KEY', VALUE])
  replies.splice(excludedUsernameIndex, 1): removes the currently logged in username (excludedUsernameIndex) from the replies []
  splice(excludedUsernameIndex, 1): (VALUE TO REMOVE, NOs of items to remove)
  (const reply of replies): looping through the replies [] to parse each data we need about each user 
  
  */

  public async getRandomUsersFromCache(
    userId: string,
    excludedUsername: string
  ): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const replies: IUserDocument[] = [];
      const followers: string[] = await this.client.LRANGE(
        `followers:${userId}`,
        0,
        -1
      );
      const users: string[] = await this.client.ZRANGE('user', 0, -1);
      const randomUsers: string[] = Helpers.shuffle(users).slice(0, 10);
      for (const key of randomUsers) {
        const followerIndex = indexOf(followers, key);
        if (followerIndex < 0) {
          const userHash: IUserDocument = (await this.client.HGETALL(
            `users:${key}`
          )) as unknown as IUserDocument;
          replies.push(userHash);
        }
      }
      const excludedUsernameIndex: number = findIndex(replies, [
        'username',
        excludedUsername,
      ]);
      replies.splice(excludedUsernameIndex, 1);
      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);
      }
      return replies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  updateSingleUserItemInCache: this method is used to update individual props in each user's hash
  userId: user hash/id
  prop: property to update
  value: value to update
  client.HSET: updating a user hash
  response: returning/retrieving the newly update user hash complete doc
  */

  public async updateSingleUserItemInCache(
    userId: string,
    prop: string,
    value: UserItem
  ): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
      await this.client.HSET(
        `users:${userId}`,
        `${prop}`,
        JSON.stringify(value)
      );
      const response: IUserDocument = (await this.getUserFromCache(
        userId
      )) as IUserDocument;
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    getTotalUsersInCache: this method is used to get the total count/number of items in the users set
    ZCARD: returns count
  */
  public async getTotalUsersInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
