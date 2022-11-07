import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

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
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

/* 
applicaton: instance of the Application class above
initialize: initialize/starts our application 
*/
const application: Application = new Application();
application.initialize();
