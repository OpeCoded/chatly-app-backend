/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import mongoose, { Query } from 'mongoose';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
/* import { NotificationModel } from '@notification/models/notification.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { socketIONotificationObject } from '@socket/notification';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template'; */
import { emailQueue } from '@service/queues/email.queue';

const userCache: UserCache = new UserCache();


/*
addCommentToDB: this method adds a comment to the DB
comments: creates a collection comment if not exist, and saves a comment data into it
post: this updates the commentsCount prop in the Post collection by 1 by finding the postId
{ new: true }: updates and returns the updated data
user: fetching owner of a post from cache
response: all data we've saved in variables. Note they must be in order of the type of the response variable
*/

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    /* if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: ''
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: response[2].username!,
        message: `${username} commented on your post.`,
        header: 'Comment Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('commentsEmail', { receiverEmail: response[2].email!, template, subject: 'Post notification' });
    } */
  }

  /*
    getPostComments: this method is used to all comments made to a post
    sort: Record<string, 1 | -1>: asc | desc
    comments: fetches all comments by matching the query that was passed and sort
  */
  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }

  /*
  getPostCommentNames: fetches names of those who commented on a post
  :::MongoDB Opretors:::
  $group: separates documents into groups according to a group key (id)
  $addToSet: adds a value into a list
  $project: this operator helps to remove the _id value since we don't need it, so it will be excluded from the final  result of commentsNamesList


  _id: null: this a group key, but we don't need it so we set it to null
  names: group name, which is a list or an array
  $addToSet: adds every username fetched into the group (i.e names)
  { $sum: 1 }: total number of docs found, 1 is the initial value, it then sum every other docs if they exist
  */
  public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);
    return commentsNamesList;
  }
}

export const commentService: CommentService = new CommentService();
