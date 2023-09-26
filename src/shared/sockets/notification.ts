import { Server } from 'socket.io';

let socketIONotificationObject: Server;

/*
Note: we are not listening to any event from the client, we only want to emit an action
*/
export class SocketIONotificationHandler {
  public listen(io: Server): void {
    socketIONotificationObject = io;
  }
}

export { socketIONotificationObject };
