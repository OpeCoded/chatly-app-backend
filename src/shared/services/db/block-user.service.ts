import mongoose from 'mongoose';
import { PushOperator } from 'mongodb';
import { UserModel } from '@user/models/user.schema';

class BlockUserService {

  /*
  userId: you
  followerId: someone you want to block
  filter: the document we want to update only
  UserModel.bulkWrite: exec multiple queries
  _id: userId: search for your own id
  $ne: mongoose not equal to operator
  blocked: { $ne }: checks the blocked field if there's no matching followerId id in it then,
  $push: we add the followerId to your blocked field

  The next updateOne is vice versa: to update blockedBy field
  */
  public async blockUser(userId: string, followerId: string): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: userId,
            blocked: { $ne: new mongoose.Types.ObjectId(followerId) },
          },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: followerId,
            blockedBy: { $ne: new mongoose.Types.ObjectId(userId) },
          },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
  }


  /*
    This uses $pull i.e remove from
  */
  public async unblockUser(userId: string, followerId: string): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
