import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';
import Logger from 'bunyan';


const log: Logger = config.createLogger('app');

class Application {
  /*
    TYPESCRIPT SYNTAX EXPLANATION
    const app: Express = express();
    VARIABLE: TYPE = VALUE;

    CLASS/METHOD TO START OUR APPLICATION
    initialize(): initializes/start/run our Application
    app: instance of Express server
    server: instance of our ChattyServer class
    new: means we are calling an instance of the constructor
    start(): public method in our setupServer.ts to start our ChattyServer
    databaseConnection(): invoking our database connection func defined in setupDatabase.ts
    this.loadConfig(): calls loadConfig() to verify if env vars defined in config.ts actually exist
    loadConfig(): this loads/imports our env vars from config.ts
    */

  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
    Application.handleExit();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }

  /*
  this method is used to catch unhandled exceptions
  process.on(): this is taking note of when an event occur
  ('uncaughtException'): event name
  SIGTERM: SIGNAL TO TERMINATE A PROCESS
  SIGINT: SIGNAL INTELLIGENCE
  */
  private static handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`);
      Application.shutDownProperly(1);
    });

    process.on('unhandleRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      Application.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      Application.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      Application.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('Exiting');
    });
  }

  /*
    this method is used to end a process after an exception was caught
  */
  private static shutDownProperly(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete');
        process.exit(exitCode);
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`);
        process.exit(1);
      });
  }
}

/*
applicaton: instance of the Application class above
initialize: initialize/starts our application
*/
const application: Application = new Application();
application.initialize();
