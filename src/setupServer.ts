import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import Logger from 'bunyan';
import { config } from '@root/config';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
import { SocketIOPostHandler } from '@socket/post';
import { SocketIOFollowerHandler } from '@socket/follower';
import { SocketIOUserHandler } from '@socket/user';

/*
app: this is an instance of our express application, with it's constructor. Which will be passed to app.ts
start(): to start the server in the app.ts, required middleware/methods are passed in here (invoked)
globalErrorHandler: to handle all error within our app
startServer: to call the HTTP server
const log: instance of createLogger
('setupServer'): this is the identifier/name for every log comming from this file
log.error: using instance of bunyan Logger to log an error (.error means we're displaying an error, we also have info, warn etc)
*/

const SERVER_PORT = 5000;
const log: Logger = config.createLogger('setupServer');

export class ChattyServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    /*
        CALLING OUR SECURITY MIDDLEWARES
        app.use: used to call middlewares to be used in our app i.e Application (app variable)
        name: name given to the security middleware
        keys: used to sign and verify cookies values
        maxAge: the amount of time the cookie will be valied for (e.g 24 * 7 * 3600000 = 7 days)
        origin: client url https://localhost:3000 (local/live)
        credentials: cookies values check
        methos: our request methods
        secure: false (devlopment) or true (production) (boolean). development !== development will return false
        */
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development',
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    );
  }

  private standardMiddleware(app: Application): void {
    /*
        CALLING STANDARD MIDDLEWARES
        compression: used to compress our requests and responses
        json: to sending json data from and to client-server, limit: request/response should not exceed 50MB
        urlencoded: to encode data sent via url to and fro server-client e.g form submission
         */
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  /*
  app.all: used to catch error related to urls in express app e.g when a dev makes requests to an endpoint that doesn't exist
  app.use: used to catch the custom errors we defined in error-handlers.ts
  if (error instanceof CustomError): this checks if an error is of type custom error we defined ourself
  */
  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: `${req.originalUrl} not found` });
    });

    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
      }
    );
  }

  /*
        CREATING OUR SERVER
        httpServer: name given to our server, app: passed in an instance of our application
        http.Server: Express server Type
        startHttpServer: listening to our server for connections
        socketIO: an instance of socketIO, it invokes the createSocketIO middleware
        socketIOConnections: I think it's used to listen to sockectIO comms
        */
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error('');
    }
  }

  /*
  io: an instance of the socketIO Server
  cors: other properties required by SocketIO
  pubClient: creates client for publishing a communication
  subClient: creates client for subscribing to a communication
  */
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    /*
        LISTENING TO HTTP SERVER CONNECTIONS
        listen: start a server listening for connections
        */
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const followerSocketHandler: SocketIOFollowerHandler =
      new SocketIOFollowerHandler(io);
    const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);

    postSocketHandler.listen();
    followerSocketHandler.listen();
    userSocketHandler.listen();
  }
}
