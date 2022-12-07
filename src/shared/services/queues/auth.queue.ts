import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { authWorker } from '@worker/auth.worker';

/*
AuthQueue: this class is used to create authjobs in the queue, the class extends the BaseQueue class, so we have access to other methods in the BaseQueue class here.
super(): brings/imposes the BaseQueue constructor here for our use
super('auth'): queueName, which was defined in the BaseQueue object class
addAuthUserJob: adds a AuthUser (job) to the queue
processJob: process jobs in a queue i.e adds/move a job from queue to the mongodb

this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB) SYNTAX: JOBPROCESS to job to queue, WORKER to move it to DB
*/
class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
