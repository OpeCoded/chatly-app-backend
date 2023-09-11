import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Get {
  /*
  notifications(): fetches notifications for currently looged in user
  notifications: array of notification docs fetched  from the DB
  */
  public async notifications(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] =
      await notificationService.getNotifications(req.currentUser!.userId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User notifications', notifications });
  }
}
