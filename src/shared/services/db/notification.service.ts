import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import mongoose from 'mongoose';

/*
getNotifications: fetches notifications from the DB
notifications: returns all docs in the notification collectoin that matches the userId passed in
$match: fetches all docs that matches the userId passed in
$lookup: fetches fields of the person sending a notification from the User collection, which is stored as: 'userFrom'
as: 'authId': we used as: 'userFrom' to fetch the authId from the Auth collection
localField: 'userFrom': on our Notification collection
foreignField: '_id': on our User collection

$project: defining all the props we need after the lookups on User, Auth collections plus the regualar Notifications collections
*/

class NotificationService {
  public async getNotifications(
    userId: string
  ): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] =
      await NotificationModel.aggregate([
        { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'User',
            localField: 'userFrom',
            foreignField: '_id',
            as: 'userFrom',
          },
        },
        { $unwind: '$userFrom' },
        {
          $lookup: {
            from: 'Auth',
            localField: 'userFrom.authId',
            foreignField: '_id',
            as: 'authId',
          },
        },
        { $unwind: '$authId' },
        {
          $project: {
            _id: 1,
            message: 1,
            comment: 1,
            createdAt: 1,
            createdItemId: 1,
            entityId: 1,
            notificationType: 1,
            gifUrl: 1,
            imgId: 1,
            imgVersion: 1,
            post: 1,
            reaction: 1,
            read: 1,
            userTo: 1,
            userFrom: {
              profilePicture: '$userFrom.profilePicture',
              username: '$authId.username',
              avatarColor: '$authId.avatarColor',
              uId: '$authId.uId',
            },
          },
        },
      ]);
    return notifications;
  }

  /*
  updateNotification: updates a notification read status to true
 _id: document id of the notification to be updated
 $set: new value to set
  */

  public async updateNotification(notificationId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    ).exec();
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await NotificationModel.deleteOne({ _id: notificationId }).exec();
  }
}

export const notificationService: NotificationService =
  new NotificationService();
