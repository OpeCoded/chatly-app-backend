import { IMessageData } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { ConversationModel } from '@chat/models/conversation.schema';
import { MessageModel } from '@chat/models/chat.schema';
import { ObjectId } from 'mongodb';

class ChatService {
  /*
  ?: incase value not available don't give us erros

  this method adds a message to db based on conversationId
  conversation: checking if the conversationId in the messageData already exists in the DB
  (conversation.length === 0): if the conversationId in the messageData wasn't found in the db, then create a new conversation document in the Conversation collection
  MessageModel.create: creates a message doc in the Messages collection
  */
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({
      _id: data?.conversationId,
    }).exec();
    if (conversation.length === 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderId: data.senderId,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt,
    });
  }

  /*
  getUserConversationList: this method fetches the last Message document (of a sender/receiver) in the Message Collection
  $match { $or: searches for all docs in the Message collection where the userId passed in matches the senderId or the receiverId and returns only the last doc
  $group: groups all docs using the conversationId
  $last: '$$ROOT': gets the last doc in the list i.e messages: IMessageData[]
  $project: collating all the data we need from our result prop
  createdAt: 1: sorting in ascending order
  */

  public async getUserConversationList(
    userId: ObjectId
  ): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt',
        },
      },
      { $sort: { createdAt: 1 } },
    ]);
    return messages;
  }

  /*
  this method is used to retrieve messages from the DB
  We want to check where the senderId = receiverId OR the receiverId = senderId
  $or: our query conditions
  messages: messages fetched by executing our query

  */
  public async getMessages(
    senderId: ObjectId,
    receiverId: ObjectId,
    sort: Record<string, 1 | -1>
  ): Promise<IMessageData[]> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return messages;
  }

  /*
  this method is used to update the pro deleteForMe or deleteForEveryonei the DB
  MessageModel.updateOne: updating the doc whose id matches the messageId that was passed in
  $set: updating/setting the new value
  */
  public async markMessageAsDeleted(
    messageId: string,
    type: string
  ): Promise<void> {
    if (type === 'deleteForMe') {
      await MessageModel.updateOne(
        { _id: messageId },
        { $set: { deleteForMe: true } }
      ).exec();
    } else {
      await MessageModel.updateOne(
        { _id: messageId },
        { $set: { deleteForMe: true, deleteForEveryone: true } }
      ).exec();
    }
  }

  /*
  this method checks for any doc in the Messages collection where the senderId or receiverId and isRead is false matches the one passed in, OR the sender=reciever or receiver = sender
  MessageModel.updateMany: setting isRead prop to true
  updateMany: updates multiple docs i.e all docs that matches the condition
  query: query conditions
  */
  public async markMessagesAsRead(
    senderId: ObjectId,
    receiverId: ObjectId
  ): Promise<void> {
    const query = {
      $or: [
        { senderId, receiverId, isRead: false },
        { senderId: receiverId, receiverId: senderId, isRead: false },
      ],
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
  }


  /*
  this method is used to update the isRead prop of a message to true
  MessageModel.updateOne(): update the message doc which matches the messageId
  $push: we're using push because we are pushing into a list
  reaction: reaction prop in the MessageModel
  $pull: removes, so esle we're removing the reaction object
  */
  public async updateMessageReaction(
    messageId: ObjectId,
    senderName: string,
    reaction: string,
    type: 'add' | 'remove'
  ): Promise<void> {
    if (type === 'add') {
      await MessageModel.updateOne(
        { _id: messageId },
        { $push: { reaction: { senderName, type: reaction } } }
      ).exec();
    } else {
      await MessageModel.updateOne(
        { _id: messageId },
        { $pull: { reaction: { senderName } } }
      ).exec();
    }
  }
}

export const chatService: ChatService = new ChatService();
