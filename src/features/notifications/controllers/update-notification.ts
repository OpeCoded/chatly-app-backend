import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Update {
  /*
    notification(): this method is used to mark a notification as read
    notificationId: id pass to the route
    emit(): sending the event to client
    addNotificationJob: adding the job to the queue
  */
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    socketIONotificationObject.emit('update notification', notificationId);
    notificationQueue.addNotificationJob('updateNotification', {
      key: notificationId,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
  }
}
