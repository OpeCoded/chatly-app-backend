/* eslint-disable @typescript-eslint/no-unused-vars */
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';
/* import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { socketIONotificationObject } from '@socket/notification';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template'; */


import { emailQueue } from '@service/queues/email.queue';

const userCache: UserCache = new UserCache();


/*
addReactionDataToDB: adds a reaction to the DB
userTo: owner of a post
reactionData: post reaction args/values gotten from the cache to be saved to the DB
getUserFromCache(`${userTo}`): getting the hash/id of a user who owns a post from the cache
if (previousReaction) {: this omits the newly created id by mongodb when a user wants to update his/her reaction which can be found in the reactionObject
ReactionModel.replaceOne({}): checks if there's is a reaction document in the DB with the (reactionData..passed in i.e postId, userTo...). If yes, replaces the reaction document if no create a new reaction doc
updatedReaction: reaction data to replace if one doc was found matching in the DB
{ upsert: true }): creates a new reaction doc if no reaction doc was found matching with the data to be replaced
PostModel.findOneAndUpdate: updating the reaction field in the Post collection using postId
$inc: increment operator to reduce and increment the count of previousReaction and type respectively in the the reactions object of a particular post.
${previousReaction}: previous reaction
${type}: new reation type made
*/


class ReactionService {
  public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData;
    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }

     const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = await Promise.all([
       userCache.getUserFromCache(`${userTo}`),
       ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
       PostModel.findOneAndUpdate(
         { _id: postId },
         {
           $inc: {
             [`reactions.${previousReaction}`]: -1,
             [`reactions.${type}`]: 1
           }
         },
         { new: true }
       )
     ]) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

/*     if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom as string,
        userTo: userTo as string,
        message: `${username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(updatedReaction[1]._id!),
        createdAt: new Date(),
        comment: '',
        post: updatedReaction[2].post,
        imgId: updatedReaction[2].imgId!,
        imgVersion: updatedReaction[2].imgVersion!,
        gifUrl: updatedReaction[2].gifUrl!,
        reaction: type!
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: updatedReaction[0].username!,
        message: `${username} reacted to your post.`,
        header: 'Post Reaction Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('reactionsEmail', {
        receiverEmail: updatedReaction[0].email!,
        template,
        subject: 'Post reaction notification'
      });
    } */

  }




  /*
  removeReactionDataFromDB: decrements a reaction count in the reactions object field of a post
  deleteOne(): deletes any reaction that matches the args { postId, type: previousReaction, username }
  updateOne: find a post by Id, decrements the prev reaction count.
  */
  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }

  /*
    getPostReactions: gets all reactions for a post
    reactions: fetches reactions from Db using the aggregate()
    $match: operator to find a doc that matches our query
    $sort: opetatorto sort data
  */
  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    return [reactions, reactions.length];
  }


  /*
  getSinglePostReactionByUsername: gets reactions made to a post using username
    mongoose.Types.ObjectId(postId): casting the postId into an actual Mongoose objectId
    [reactions[0], 1]: if aleast there's one item in the list return, get the item at index 0, else return an empty list
  */
  public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } }
    ]);
    return reactions.length ? [reactions[0], 1] : [];
  }

  /*
  getReactionsByUsername: get all reactions made by a user irrespective of the number of posts
  */
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username: Helpers.firstLetterUppercase(username) } }
    ]);
    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
