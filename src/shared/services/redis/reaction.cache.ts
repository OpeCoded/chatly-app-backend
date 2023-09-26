import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import {
  IReactionDocument,
  IReactions,
} from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('reactionsCache');

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  /*
  ( , ) or [ , ]: KEY , VALUE
  HSET( , , ): KEY/ID , FIELD/COLLECTION , VALUE/DATA TO UPDATE OR SAVE
  savePostReactionToCache: this adds a reaction made to a post to the reactionsCache
  NOTE: reactions are saved inside a list not hashes/sets
  LPUSH: adding a data from into the cache from the begining of a list
  RPUSH: adding a data from into the cache from the end of a list
  if (previousReaction): checks if a user already reacted to a post
  if (type): checks if a reaction was made, then push the reaction into a list
  LPUSH(`reactions:${key}`, JSON.stringify(reaction): creates a list to store all reactions for a particular post using the postId. (FIELD, VALUE)
  HSET(`posts:${key}`, dataToSave): update post set i.e reactions for a particular post
  */
  public async savePostReactionToCache(
    key: string, //postId
    reaction: IReactionDocument, //a single reaction
    postReactions: IReactions, //all reactions for a particular post
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${key}`, 'reactions',
        JSON.stringify(postReactions));
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  removePostReactionFromCache: removes a reaction made earlier when a user want to make another reation OR remove reaction totally

  response: fetches all reactions for a particular post in form of a list
  LRANGE(`reactions:${key}`,0,-1): 0 is beginning, -1 means end of the list
  userPreviousReaction: gets a user's previous reaction using username
  multi.LREM(): removes an item from a list (KEY, No. of Items to remove, ELEMENT to remove). which is the user  previous reaction that was fetch based on username
  */
  public async removePostReactionFromCache(
    key: string, //postId
    username: string,
    postReactions: IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(
        `reactions:${key}`,
        0,
        -1
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(
        response,
        username
      ) as IReactionDocument;
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      //updating reactions field in posts collection (cache) after removal of a reaction
      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
  getReactionsFromCache: this is used to get all the reactions for a single post using postId. It's going to return a list.
  number: is count i.e total number of reactions returned
  reactionsCount: the lenght of the list returned
  response: list of reactions returned
  for (const item of response): loopinf through the list of reactions returned, we parse it and convert it to IReactionDocument with push()
  response.length ?: if response contains an item or > 0, return a list and reaction count ELSE return an empty list and count zero
    */
  public async getReactionsFromCache(
    postId: string
  ): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionsCount: number = await this.client.LLEN(
        `reactions:${postId}`
      );
      const response: string[] = await this.client.LRANGE(
        `reactions:${postId}`,
        0,
        -1
      );
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }
      return response.length ? [list, reactionsCount] : [[], 0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    getSingleReactionByUsernameFromCache(): gets reaction made by a user using username and postId
    find(list,(listItem: IReactionDocument): looping through the list of reactions returned
    listItem?.postId === postId: we're returning the items that match witht the postId and username passed into the method
    result ? [result, 1]: if there's a result, return it and lenght is set to just 1 since it's only a single reaction we're fetching
  */
  public async getSingleReactionByUsernameFromCache(
    postId: string,
    username: string
  ): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(
        `reactions:${postId}`,
        0,
        -1
      );
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }
      const result: IReactionDocument = find(
        list,
        (listItem: IReactionDocument) => {
          return listItem?.postId === postId && listItem?.username === username;
        }
      ) as IReactionDocument;

      return result ? [result, 1] : [];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  /*
    getPreviousReaction: this gets reactions object based on username
    looping through the response list, then cast the each item as IReactionDocument
    listItem.username === username: getting the IReaction Doc item that matches a username

  */
  private getPreviousReaction(
    response: string[],
    username: string
  ): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item) as IReactionDocument);
    }
    return find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}
