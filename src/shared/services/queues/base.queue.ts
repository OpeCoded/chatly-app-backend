import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter, BullAdapter, createBullBoard } from '@bull-board/express';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@auth/user/interfaces/user.interface';
import { IPostJobData } from '@post/interfaces/post.interface';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
// import { IEmailJob, IUserJob } from '@user/interfaces/user.interface';
// import { IPostJobData } from '@post/interfaces/post.interface';
// import { IReactionJob } from '@reaction/interfaces/reaction.interface';
// import { ICommentJob } from '@comment/interfaces/comment.interface';
// import { IBlockedUserJobData, IFollowerJobData } from '@follower/interfaces/follower.interface';
// import { INotificationJobData } from '@notification/interfaces/notification.interface';
// import { IFileImageJobData } from '@image/interfaces/image.interface';
// import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

/*
IBaseJobData: defining all the types passed as the data: value while creating a job i.e addjob(queueName, data)
let: we used let instead of const because we're still going to reassign the value for bullAdapters when using Set(bullAdapters)
bullAdapters: this houses all queues created
bullAdapters.push: moves/pushes all newly created queues into the bullAdapters[]
Set(bullAdapters): removes duplicate queues
setBasePath('/queues'): sets the path to our queues we want to view on our dashboard
createBullBoard: Queues dashboard
this.queue.on(): events available for us to listen to when using queues
addJob: method to create a new job inside the queue
concurrency: number of jobs to be processed at a given time e.g 5 jobs at a time


*/

type IBaseJobData = IAuthJob | IEmailJob | IPostJobData | IReactionJob;

// | ICommentJob
// | IFollowerJobData
// | IBlockedUserJobData
// | INotificationJobData
// | IFileImageJobData
// | IChatJobData
// | IMessageData
// | IUserJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
    });
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): void {
    this.queue.process(name, concurrency, callback);
  }
}
