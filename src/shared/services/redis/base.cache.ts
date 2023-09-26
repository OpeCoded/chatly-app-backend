import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

/*
Our Redis BaseCache: every redis cache we create will inherit from this base class
In this file we created our redis client and logger

When we instantiate, the constructor would be called with super, and then we pass in the cacheName
cacheName: the cacheName will help us know where an error is coming from
RedisClient: creating a type for our client
*/
export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  log: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }
}
