import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import mongoose from 'mongoose';
import { followerQueue } from '@service/queues/follower.queue';
import { socketIOFollowerObject } from '@socket/follower';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Add {
  /*
  follower: method to add a follower
  userCache: we're using this to fetch some additional data of a user from the userCache
  followersCount: updates the followersCount prop of the person followed in the cache (nos of people following me)
  followeeCount: updates the followingCount prop of the prrson who just followed another user (nos of people I'm following)
  (`${followerId}`, 'followersCount', 1): person beign followed ID, prop/field to update, value to $inc
   Promise.all: executes the async operations
   cachedFollower, cachedFollowee: getting the full data of follower and followee from userCache
   userData(): this method is used to model the info we need about a follower i.e the fields which will be sent to the client side using socketIO
   followerObjectId: creating an id for a follower
   addFolloweeData: saves the data of the person following another person in the hash of the person being followed i.e cachedFollower
   response[0]: is cachedFollower from our response i.e the first item.
   emit('add follower', addFolloweeData): sending the data of the person following another person to the client side
   addFollowerToCache: this creates a following hash, which houses all the users a user is following...the people I follow
   addFolloweeToCache: this creates a followers hash, which houses all the users that is following a particular user...the people following me
   followerQueue.addFollowerJob: invoking our queue
   keyOne, keyTwo: userId, followeeId args from follower.service.ts addFollowerToDB()
   */
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    // update count in cache
    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
    await Promise.all([followersCount, followeeCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

    const followerObjectId: ObjectId = new ObjectId();
    const addFolloweeData: IFollowerData = Add.prototype.userData(response[0]);
    socketIOFollowerObject.emit('add follower', addFolloweeData);

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followerId}`);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser!.userId}`);
    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
