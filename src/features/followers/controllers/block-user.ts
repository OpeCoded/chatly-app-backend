import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@service/redis/follower.cache';
import { blockedUserQueue } from '@service/queues/blocked.queue';

const followerCache: FollowerCache = new FollowerCache();

export class AddUser {

  /*
    this method is used to block a user
    followerId: the id of the user you want to block
    updateBlockedUser: updates the cache for block or unblock
    
  */
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'block');
    blockedUserQueue.addBlockedUserJob('addBlockedUserToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
    blockedUserQueue.addBlockedUserJob('removeBlockedUserFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }

  /*
    updateBlockedUser: used to update the redis cache when there's a block or unblock
  */
  private async updateBlockedUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);
  }
}
