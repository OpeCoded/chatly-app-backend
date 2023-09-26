import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addChatSchema } from '@chat/schemes/chat';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import {
  IMessageData,
  IMessageNotification,
} from '@chat/interfaces/chat.interface';
import { socketIOChatObject } from '@socket/chat';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { MessageCache } from '@service/redis/message.cache';
import { chatQueue } from '@service/queues/chat.queue';

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  /*

  RPUSH: adds to the bottom of a list
  LPUSH: adds data to the top of a list i.e the newest data with take index 0

  message(): this method creates a new conversation
  req.body: destructuring values sent from the request body
  fileUrl: if the chat starter wishes to send an image/file
  messageObjectId: our message Id to be saved in the Message collection and cache
  conversationObjectId: our conversation Id to be saved in the Conversation collection and cache
  !conversationId ?: checking if a conversationId exists before, cus it's always null for first time convo
  new mongoose.Types.ObjectId(conversationId): casting conversationId as ObjectId because it's coming as a string from the req body if it already exist
  sender: to get the data of a message sender from the cache
  selectedImage.length (i.e > 0): checking if the user selected an image
  result: uploads the image
  fileUrl: pass the public id from the uploade response to your cloudinary directory url

  messageData: constructing a message data to be saved to the mongo DB and redis cache
  emitSocketIOEvent(messageData): emitting our messageData to the client
  !isRead: send notification is isRead is false i.e the receiver of a message is not logged in or he's on another page, but if they're on the same chat page the isRead will be true
  messageCache.addChatListToCache: creates a chatList for the sender first and then creates also for the receiver

  messageCache.addChatMessageToCache: saves messageData in the messages tree based on the conversationId i.e subkey
  */
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage,
    } = req.body;
    let fileUrl = '';
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId
      ? new ObjectId()
      : new mongoose.Types.ObjectId(conversationId);

    const sender: IUserDocument = (await userCache.getUserFromCache(
      `${req.currentUser!.userId}`
    )) as IUserDocument;

    if (selectedImage.length) {
      const result: UploadApiResponse = (await uploads(
        req.body.image,
        req.currentUser!.userId,
        true,
        true
      )) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/dlml4ol3c/image/upload/v${result.version}/${result.public_id}`;
    }

    const messageData: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverAvatarColor,
      receiverProfilePicture,
      receiverUsername,
      senderUsername: `${req.currentUser!.username}`,
      senderId: `${req.currentUser!.userId}`,
      senderAvatarColor: `${req.currentUser!.avatarColor}`,
      senderProfilePicture: `${sender.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deleteForMe: false,
    };
    Add.prototype.emitSocketIOEvent(messageData);

    if (!isRead) {
      Add.prototype.messageNotification({
        currentUser: req.currentUser!,
        message: body,
        receiverName: receiverUsername,
        receiverId,
        messageData,
      });
    }

    await messageCache.addChatListToCache(
      `${req.currentUser!.userId}`,
      `${receiverId}`,
      `${conversationObjectId}`
    );
    await messageCache.addChatListToCache(
      `${receiverId}`,
      `${req.currentUser!.userId}`,
      `${conversationObjectId}`
    );
    await messageCache.addChatMessageToCache(
      `${conversationObjectId}`,
      messageData
    );
    chatQueue.addChatJob('addChatMessageToDB', messageData);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Message added', conversationId: conversationObjectId });
  }

  /* 
  adds two users chatting with each other to the users chat list
  req.body: user1 and user2 passed from the req body
  socketIOChatObject.emit('add chat users', chatUsers): sending updated user chatlist to the client
  */
  public async addChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.addChatUsersToCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
  }

    /* 
  removes two users chatting with each other from the users chat list
  */
  public async removeChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
  }

  /*
  This method is used to emit event related to chat
  'message received': event name, used to update the main chat page
  'chat list': event used to update the chat list
  */
  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }

  /*
  This method is used to send message notifications
  cachedUser: id of the user to receive a notification
  cachedUser.notifications.messages: checks if user notification field and message prop is true i.e user enabled messages notifications
  */
  private async messageNotification({
    currentUser,
    message,
    receiverName,
    receiverId,
  }: IMessageNotification): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      `${receiverId}`
    )) as IUserDocument;
    if (cachedUser.notifications.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message notification from ${currentUser.username}`,
      };
      const template: string =
        notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessageEmail', {
        receiverEmail: cachedUser.email!,
        template,
        subject: `You've received messages from ${currentUser.username}`,
      });
    }
  }
}
