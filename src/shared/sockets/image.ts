import { Server } from 'socket.io';

let socketIOImageObject: Server;

/* socketIOImageObject: used to listen to image operations events */
export class SocketIOImageHandler {
  public listen(io: Server): void {
    socketIOImageObject = io;
  }
}

export { socketIOImageObject };
