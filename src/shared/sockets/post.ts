
import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { Server, Socket } from 'socket.io';


/*
listen(): listen for connection event
socketIOPostObject: used to listen for/emit events outside of this class
We're going to emit events from our post controller not inside here
*/
export let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  /*
  socket.on(): listening to an event
  ('reaction'): event name
  (reaction: IReactionDocument): reaction document call back (reaction doc from the server)
  this.io.emit: sends feedback to client
  ('update like', reaction): event to be listened for on the client side, reaction document data sent back to the client
  */
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      //listening to reaction events
      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('update like', reaction);
      });

      //listening to comment events
      socket.on('comment', (data: ICommentDocument) => {
        this.io.emit('update comment', data);
      });
    });
  }
}
