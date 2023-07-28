import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { findIndex, find, filter, remove } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import {
  IMessageData,
  IChatUsers,
  IChatList,
  IGetMessageFromCache,
} from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';
import { IReaction } from '@reaction/interfaces/reaction.interface';

const log: Logger = config.createLogger('messageCache');

export class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }

  /*
  This method creates a chat list for each user
  userChatList: checks if a senderId (chatter) already exists in the chatlist
  userChatList.length: if not user id matching was found in the chatlist, add the senderId to the chatList
  RPUSH: right push, adds the senderIds from the right, so they'd be sorted as they're being added
  receiverIndex: checks if the receiver of a message also exist in the chatList, if not exsit add. Reason: in order not to have multiple receiver
  listItem: receiverId, conversationId
  includes(receiverId): checks if the receiverId already exist in the listItem

  */
  public async addChatListToCache(
    senderId: string,
    receiverId: string,
    conversationId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      if (userChatList.length === 0) {
        await this.client.RPUSH(
          `chatList:${senderId}`,
          JSON.stringify({ receiverId, conversationId })
        );
      } else {
        const receiverIndex: number = findIndex(
          userChatList,
          (listItem: string) => listItem.includes(receiverId)
        );
        if (receiverIndex < 0) {
          await this.client.RPUSH(
            `chatList:${senderId}`,
            JSON.stringify({ receiverId, conversationId })
          );
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  This method add a message to the messages tree using the conversationId as the subkey
  value: is the messageData to be saved
  */
  public async addChatMessageToCache(
    conversationId: string,
    value: IMessageData
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(
        `messages:${conversationId}`,
        JSON.stringify(value)
      );
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
This method adds users chatting with each other into a list chatUsersList ( can be found in getChatUsersList() ). i.e once a user clicks on another user's username to chat with, they're both added to a list

value: user one and user two

users: users already in the chatUsersList
usersIndex: is the position of user in the list [0,1,2,3...], it checks in the chatUsersList if userOne and userTwo exists in it i.e two users chatting with each other
chatUsers: empty list where new chatters will be added
usersIndex === -1: if userOne and userTwo doesn't exist in the chatUsersList, adds them to the list else return the existing users in the list
chatUsers: getting the updated users in the chatUsersList
  */

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers: IChatUsers[] = [];
      if (usersIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  this method removes users from the chatUsersList
  (usersIndex > -1): if user one and two exists in the chatUsersList, remove them
  LREM(KEY, INDEX TO REMOVE, VALUE TO REMOVE): removes an item from a list

  */
  public async removeChatUsersFromCache(
    value: IChatUsers
  ): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers: IChatUsers[] = [];
      if (usersIndex > -1) {
        await this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  This method uses the convesationId to fetch messages from the message hash
  userChatList: all conversations list
  chatList:${key}: user id
  0, -1: returns all items in the list
  conversationChatList: empty list to hold last message received by a user
  (const item of userChatList): looping through each item in the userChatList i.e the conversation list
  lastMessage: the last message on the list
  `messages:${chatItem.conversationId}`: this gets the last message received by a user, profile pic, username, date which we will display on the chatscreen
  -1: gets the last item
  conversationChatList.push: adding last message to the conversationChatList

  */
  public async getUserConversationList(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(
        `chatList:${key}`,
        0,
        -1
      );
      const conversationChatList: IMessageData[] = [];
      for (const item of userChatList) {
        const chatItem: IChatList = Helpers.parseJson(item) as IChatList;
        const lastMessage: string = (await this.client.LINDEX(
          `messages:${chatItem.conversationId}`,
          -1
        )) as string;
        conversationChatList.push(Helpers.parseJson(lastMessage));
      }
      return conversationChatList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }


  /*
  this method is used to get the actual messages sent using the senderId and the receiverId
  userChatList: checks if the senderId is in the chatList i.e the list that holds all conversations
  receiver: checks if the receiverId is in the chatList
  listItem.includes(): checks if the receiverId that was passed in matches with anyone in the userChatList
  parsedReceiver: casting our receiver as IChatList type
  userMessages: gets all messages from the messages hash using the parsedReceiver.conversationId which was made available to through IChatList Interface
  chatMessages: list to hold all messages retrieved
  chatItem: each message
  (const item of userMessages): looping through the messages retrieved, then add/push each message in to the list chatMessages[]
  return []: if no message(s) was found, return an empty list
  */
  public async getChatMessagesFromCache(
    senderId: string,
    receiverId: string
  ): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver: string = find(userChatList, (listItem: string) =>
        listItem.includes(receiverId)
      ) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(
        receiver
      ) as IChatList;
      if (parsedReceiver) {
        const userMessages: string[] = await this.client.LRANGE(
          `messages:${parsedReceiver.conversationId}`,
          0,
          -1
        );
        const chatMessages: IMessageData[] = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item) as IMessageData;
          chatMessages.push(chatItem);
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }


  /*
  this method is used to update the deleteForMe and deleteForEveryone boolean property
  [type: string]: deleteForMe or deleteForEveryone
  { index, message, receiver }: destructuring the values we returned in the getMessage()
  chatItem: casting the actual message as IMessageData
  chatItem.deleteForMe: we access the deleteForMe prop through the IMessageData and we set the value appropriately
  LSET: used to update an item in a list
  this.client.LSET(conversationId, position of the message in the list, the actual message): we're are adding all props we updated back to the list
  LINDEX: used to get the last updated item in a list
  lastMessage: last message item that was updated in the messages hash
  */
  public async markMessageAsDeleted(
    senderId: string,
    receiverId: string,
    messageId: string,
    type: string
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const { index, message, receiver } = await this.getMessage(
        senderId,
        receiverId,
        messageId
      );
      const chatItem = Helpers.parseJson(message) as IMessageData;
      if (type === 'deleteForMe') {
        chatItem.deleteForMe = true;
      } else {
        chatItem.deleteForMe = true;
        chatItem.deleteForEveryone = true;
      }
      await this.client.LSET(
        `messages:${receiver.conversationId}`,
        index,
        JSON.stringify(chatItem)
      );

      const lastMessage: string = (await this.client.LINDEX(
        `messages:${receiver.conversationId}`,
        index
      )) as string;
      return Helpers.parseJson(lastMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  this method is used to mark all messages in a conversation as read
  userChatList: this fecthes all conversations
  receiver: checks if the receiver id is included in the userChatList
  messages: fetching all message with the same conversationId
  unreadMessages: filtering through the messages fetched for prop isRead: false
  !Helpers.parseJson(listItem).isRead: pasrsing each message to IMessageData and then we check if the isRead is false with !
  (const item of unreadMessages): looping through all unread messages then,
  chatItem.isRead = true: we set it to true then,
  client.LSET(MESSAGE, POSITION IN THE LIST, MESSAGE ITEM): this updates the list
  lastMessage: getting the last message in the list and then send it back to the client
  */
  public async updateChatMessages(
    senderId: string,
    receiverId: string
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver: string = find(userChatList, (listItem: string) =>
        listItem.includes(receiverId)
      ) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(
        receiver
      ) as IChatList;
      const messages: string[] = await this.client.LRANGE(
        `messages:${parsedReceiver.conversationId}`,
        0,
        -1
      );
      const unreadMessages: string[] = filter(
        messages,
        (listItem: string) => !Helpers.parseJson(listItem).isRead
      );
      for (const item of unreadMessages) {
        const chatItem = Helpers.parseJson(item) as IMessageData;
        const index = findIndex(messages, (listItem: string) =>
          listItem.includes(`${chatItem._id}`)
        );
        chatItem.isRead = true;
        await this.client.LSET(
          `messages:${chatItem.conversationId}`,
          index,
          JSON.stringify(chatItem)
        );
      }
      const lastMessage: string = (await this.client.LINDEX(
        `messages:${parsedReceiver.conversationId}`,
        -1
      )) as string;
      return Helpers.parseJson(lastMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

/*
updateMessageReaction: this method is used to add reactions to a message
reaction: string: like, angry, smile, lol etc
if (parsedMessage): checks the reaction list to see if the sender name exists in the list. If exist, remove the sender name before adding another one.
(type === 'add'): if type is 'add', then adds a new reaction, else just update the message as it is since the remove() has been used already to remove the existing sender name in the reation list
reactions.push: add the new reaction to the IReaction list
parsedMessage.reaction[]: list containing existing reactions and the new reaction
client.LSET(`messages:${conversationId}: updating the messages hash back/saving the message that was reacted on
updatedMessage: the message just updated or reacted to 
*/
  public async updateMessageReaction(
    conversationId: string,
    messageId: string,
    reaction: string,
    senderName: string,
    type: 'add' | 'remove'
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const messages: string[] = await this.client.LRANGE(
        `messages:${conversationId}`,
        0,
        -1
      );
      const messageIndex: number = findIndex(messages, (listItem: string) =>
        listItem.includes(messageId)
      );
      const message: string = (await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      )) as string;
      const parsedMessage: IMessageData = Helpers.parseJson(
        message
      ) as IMessageData;
      const reactions: IReaction[] = [];
      if (parsedMessage) {
        remove(
          parsedMessage.reaction,
          (reaction: IReaction) => reaction.senderName === senderName
        );
        if (type === 'add') {
          reactions.push({ senderName, type: reaction });
          parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        } else {
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        }
      }
      const updatedMessage: string = (await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      )) as string;
      return Helpers.parseJson(updatedMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  chatUsers: gets all users in chatUsers tree in the cache
  const item of chatUsers: loop through each item in the list
  chatUser: each item (user)
  push(chatUser): add each item to the chatUsersList
  */
  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const item of chatUsers) {
      const chatUser: IChatUsers = Helpers.parseJson(item) as IChatUsers;
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }

  /*
  this method is used to get individual message (just like in getChatMessagesFromCache()) from the cache which will be marked for deletion
  it's being used in markMessageAsDeleted() above

  receiver: check if the receiverId is in the userChatList
  message: listItem.includes: instead of looping through, we use includes to check the message to fetch the one that has the messageId in it

  */
  private async getMessage(
    senderId: string,
    receiverId: string,
    messageId: string
  ): Promise<IGetMessageFromCache> {
    const userChatList: string[] = await this.client.LRANGE(
      `chatList:${senderId}`,
      0,
      -1
    );
    const receiver: string = find(userChatList, (listItem: string) =>
      listItem.includes(receiverId)
    ) as string;
    const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
    const messages: string[] = await this.client.LRANGE(
      `messages:${parsedReceiver.conversationId}`,
      0,
      -1
    );
    const message: string = find(messages, (listItem: string) =>
      listItem.includes(messageId)
    ) as string;
    const index: number = findIndex(messages, (listItem: string) =>
      listItem.includes(messageId)
    );

    return { index, message, receiver: parsedReceiver };
  }
}
