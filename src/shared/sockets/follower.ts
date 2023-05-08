import { IFollowers } from '@follower/interfaces/follower.interface';
import { Server, Socket } from 'socket.io';

export let socketIOFollowerObject: Server;

/*
socketIOFollowerObject = io: this allows us to be able to call the .emit of the follower socket in our controller
listen(): our listener... when a user unfollows another user
socket.on('unfollow user',: event we're listening to on the client side
(data: IFollowers): data that will be sent when the event is listened to
emit('remove follower': event we'll emit. data): data sent back to the user
*/
export class SocketIOFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow user', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}
