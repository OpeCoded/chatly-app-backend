import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

/*
This class calls the connect() to connect ot Redis
extends BaseCache: we're inheriting the class BaseCache, so we have acess to everything in the class
super: allows us to get access to the constructor in the BaseCach class (Base class)
redisConnection: our cacheName for redis connection

*/
const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      log.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
