# SOCIAL NETWORK MERN - UZOCHUKWU EDDIE ODIZI


#  INTRODUCTION 


#  1. INTRODUCTION 

# Features Covered

Authentication
Posts
Comments
Reactions
Chat
Follow, Following, Block
Image upload
Notifications


# Backend Tools

NodeJs
MongoDB
TypeScript
Redis (used as caching layer for frequently used data: posts, comments, reactions and user data)
Sendgrid: for notifications (in proudction), nodemailer (in developement)
PM2: as process manager for our production environment
ExpressJs
Cloudinary: for storing images 
Bull Library: as a messaging queue. Before data is sent to the database (MongoDB), we'll pass the data to the message queue, then to workers, workers would read the data from message queue and send it to MongoDB


# Frontend Tools

React
Redux Toolkit
Sass
AXIOS: for making requests 
React Icons
Cloudinary 


# Infrastruction & Deployment Tools

AWS
Terraform: will be used to setup our AWS features
CI/CD (Continous Integration / Continous Development): CircleCI


# APP DEMO


# APP SECTIONS


# GITHUB REPOS




# 2. BACKEND INTRODUCTION 


# TOOLS DESCRIPTION 

NodeJs: Javascript runtime with TypeScript
MongoDB: to store data
Redis: in-memory cache
Message Queue: Redis-based message queue
Terraform: Infrastructure as code. AWS will be used to deploy, Terraform will be used to setup our infrastructure
CircleCI: CI/CD platform
Git: Version control tool, setup 3 environments STAGING, DEVELOPMENT AND PRODUCTION enivironments 
Github: Code hosting. From github, we'll connect to CircleCI and CircleCI does CI/CD
AWS: Cloud computing platform. This is where our infrastructure (AWS services) would be setup using Terraform



# APP FEATURES

Authentication: sign up, sign in, password reset, sign out, current user check
Chat/Messaging: private chat, send images in chat, add message reactions, retrieve messages, mark as read, delete messages
User: Get single user, get multiple users with pagination, select random users, edit profile
Post: Create posts (with or without images), get posts, update posts, edit posts 
Comments: add comments, get single comments, get multiple comments 
Reactions: add, get, remove reactions 
Images: add images to posts, upload profile image, background images, retrieve images, delete images 
Follow, Unfollow, Block, Unblock
Notification: Notification Settings, Retrieve & Display Notifications, Delete & Update Notifications 


# INSTALL TOOLS
Install the tools that are needed to go through the course by using the links below:


NodeJS (You can install the current version or the current LTS version. I would recommend the current LTS version) - https://nodejs.org/en/

MongoDB - https://www.mongodb.com/docs/manual/administration/install-community/

MongoDB Compass - https://www.mongodb.com/try/download/compass

Redis - https://redis.io/docs/getting-started/installation/

VSCode or any suitable IDE of choice - https://code.visualstudio.com/download


# VS CODE EXTENSIONS

Throughout this course, I will be using some vscode extensions. You can install these extensions if you want. Its optional to install the extensions.

Auto Import - https://marketplace.visualstudio.com/items?itemName=steoates.autoimport

EditorConfig - https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig

ENV - https://marketplace.visualstudio.com/items?itemName=IronGeek.vscode-env

ES7+ React/Redux/React-Native - https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets

ESLint - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

HashiCorp Terraform - https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform

Prettier - Code formatter - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

REST Client - https://marketplace.visualstudio.com/items?itemName=humao.rest-client

SCSS Formatter - https://marketplace.visualstudio.com/items?itemName=sibiraj-s.vscode-scss-formatter

vscode-icons - https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons

YAML - https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml



# 3. BACKEND: PROJECT SETUP


# INTRODUCTION


# CREATING BACKEND PROJECT

Goto terminal
Create your project backend: mkdir chatly-backend (i.e project name)
Cd into the newly created dir: cd chatly-backend
Open your project in vscode: code .
Create package.json file: npm init -y. This file will hold our dev dependencies, meta data and script commands
Goto package.json, change the value for "main": to app.js which will serve as the entry point of our application
Install typescript: brew install typescript
Init typescript: tsc --init . This creates a tsconfig.json file, which holds the configurations we want to use for our TS project



# TS CONFIG

Copy the tsconfig.json file provided in the course and paste it in yours

# FOLDER STRUCTURE SETUP 
Create your src folder as specified in the tsconfig.json file. This folder will house all our codes for the project
Create a dir features in the src dir
Create a dir shared in the src dir (it will house all reuseable components/codes)
Create a dir globals in the shared dir
Create a dir services in the shared dir (this will house everything related to mongodb)
Create a dir sockets in the shared dir (this will house everything related to socketIO)
Create a dir workers in the shared dir (this will house the workers that will read data from the message queue)
Create a dir db in the services dir (this will house files for db connection, making queries to mongodb)
Create a dir queues in the services dir (this will hold data queues before sending to db)
Create a dir emails in the services dir (this will hold our email service)

Create app.ts in the src dir (this is our entry file)
Create config.ts, routes.ts in the src dir
Create setupDatabase.ts in the src dir (this is for connection to db)
Create setupSever.ts in the src dir (this is for our application/project server, starting the server)


# SETUP SERVER CLASS (setupSever.ts)

Install express: npm i express (server framework)
Import {Application, json, urlencoded, Response, Request, NextFunction } from express 
Install declaration file for express: npm i --save-dev @types/express
Create a class ChattyServer


# STANDARD MIDDLEWARE (setupSever.ts)

Install the middleware libraries: npm i cors helmet hpp cookie-session compression express-async-errors http-status-codes

- cors, helmet, hpp: security middlware
- cookie-session, compression: standard middlware
- express-async-errors: to catch errors coming from asycn await methods
- http-status-codes: for http status codes

Import the libraries you just installed, install their file declarations
Setup your middlewares methods


# SETUP HTTP SERVER PART 1 (setupServer.ts)

Create a var SERVER_PORT
Inside startHttpSever middleware, listen to your server port
Make the startServer middleware async with Promise, create your server in the method

Goto app.ts, 
Import express, ChattyServer i.e our Application server class from setupServer.ts
Create a class Application, Create an instance of it (i.e a var application)

Install nodemon: npm i -g nodemon . This will help help us to restart / refresh the server
Goto package.json, add "dev" key to the the scripts object. This will be used in running our sever by just calling the keys defined.

# SETUP HTTP SERVER PART 2 (setupServer.ts)

Install ts-node as dev dependency: npm i ts-node -D . This allows us to run typescript locally
Run cmd: npm run dev (the script key we created in package.json, to start our application)
After this you should have your server running: "Server running on port 5000"
- Hint:  Use this to kill all other running port: killall -9 node
Install tsconfig-paths library for typescript to recognize our absolute path changes e.g from ../../../ to @feature/. CMD: npm install --save-dev tsconfig-paths
Paste this inside the dev key in scripts object in package.json: -r tsconfig-paths/register


# DATABASE CONNECTION SETUP (setupDatabase.ts)

Install mongoose: npm i mongoose
Goto setupDatabase.ts, Import mongoose
Create an anonymous default function 
Goto app.ts, import your databaseConnection with any name (because it's an anonymous func) from the setupDatabase
Invoke the databaseConnection() inside the initialize()
Run you app: you should get the below:

Server running on port 5000
Connection to database successful!


# ENVIRONMENT CONFIG CLASS PART 1 (config.ts)

We want to setup our environment variables for the project in .env file, so we can call them using process.env.the var wherever we need them.

Install env: npm i dotenv
Create a .env file in the root of the project
Create the following environment variables in it:
DATABASE_URL, JWT_TOKEN, NODE_ENV, SECRET_KEY_ONE, SECRET_KEY_TWO, CLIENT_URL

Goto config.ts, import dotenv
Load all environment vars from .env file using dotenv.config
Create a class Config, Create and instance of it
Add all environment vars in the .env file inside the Config{} class publicly
Create a constructor for the Config{} class
Create a method validateConfig() for the Config class

Goto app.ts
Inside the Application class, create a method loadConfig
Import the exported instance of the Config class from config.ts i.e const config in app.ts
Call loadConfig() in the initialize()


# ENVIRONMENT CONFIG CLASS PART 2 (config.ts)
We want to make use of our environment values

Goto setupServer.ts
Import the exported instance of the Config class from config.ts
Inside the securityMiddleware > cookieSession: use config.the_env_varName to set the values for the keys property and other properties in other middlewares

Goto setupDatabase.ts, Import config from config.ts
Use config to call the database url in the connect()


# SOCKET IO SETUP (setupServer.ts)

Install socket.io/redis-adapter: npm install @socket.io/redis-adapter redis socket.io
* This allows to broadcast events between several socket.io servers. (i.e to maintain communications when using socket.io, if a user disconnects and the reconnects, commmunication will continue)
Goto setupServer.ts, Import Server from socket.io
Import createClient from redis
import createAdapter from @socket.io/redis-adapter
Inside the createSocketIO middleware
Create an instance of the SocketIO server
Create REDIS_HOST env var in .env file, add it to Config class in config.ts
Create pubClient, subClient
Create an instance of socketIO in the startServer()

Create a method socketIOConnections()
Call socketIOConnections() inside the startServer method
Start redis server in a separate terminal: redis-server 
Start MongoDB service in separate terminal: brew services start mongodb-community@6.0
Start your app: npm run dev


# ROUTE FUNCTIONS (routes.ts)

Goto routes.ts

Create an anonymous function, pass in express Application
Goto setupServer.ts, import applicationRoutes (we're importing it with any name because it's an anon func) from routes.ts
Inside the routesMiddleware, call the applicationRoutes and pass in app


# GLOBAL ERROR HANDLER (error-handler.ts)

Create a new dir helpers in src > shared > global
Create a file error-handler.ts in the dir 
Import http-status-codes
Create interfaces IErrorResponse, IError
Create an abstract class CustomError
Create error class as per your usage: BadRequestError, NotFoundError, NotAuthorizedError, FileTooLargeError, ServerError.

Goto setupServer.ts, inside the globalErrorHandler middleware
Use app.all(), app.use()

# LOGGER SETUP - BUNYAN (i.e custom error logger instead of using console.log) (config.ts)

Install bunyan: npm install bunyan
Install it's file declaration type: npm i --save-dev @types/bunyan
Goto config.ts, Import bunyan from bunyan
Create a method createLogger()

Goto setupServer.ts, import Logger
Create an instance of the createLogger
Use log.error, log.info in the setupServer.ts to display logs/errors as per your usage 
Repeat the above steps for setupDatabase.ts

Goto package.json, add | ./node_modules/.bin/bunyan to your "dev" script
Start you app, you should see something like below 

[2022-11-07T10:37:24.732Z]  INFO: setupServer/8073 on OpeCodeds-MacBook-Pro.local: Server has started with process 8073
[2022-11-07T10:37:24.735Z]  INFO: setupServer/8073 on OpeCodeds-MacBook-Pro.local: Server running on port 5000
[2022-11-07T10:37:24.818Z]  INFO: setupDatabase/8073 on OpeCodeds-MacBook-Pro.local: Connection to database successful!


# ESLINT SETUP (error-handler.ts)

Install VSCode extension editorconfig, eslint, prettier if you haven't
Install these libraries as dev dependencies: npm i -D eslint-config-prettier prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
Create a file .editorconfig in the root of the project
Copy and paste the editorconfig snippet from their website in the file

Create a file .prettierrrc.json in the root of the project
Create a file .eslintrc.json in the root of the project

Goto package.json, add a new script lint:check, lint:fix, prettier:check, prettier:fix to the scripts object

Run: npm run lint:check - to check for lint errors
Run: npm run lint:fix - to fix lint errors
- [run the above as well for prettier ]


# CREATE GITHUB REPO

Goto github, create a new repo: chatly-backend
Create a file .gitignore, .eslintignore in your project root, generate a template from gitignore.io by just typing node, then hit the search button. Paste it in your .gitignore and .eslintignore file

Run the following in your project: 
rm -rf .git: stops an initialized git repo from reintitializing
git init
git add .
git commit -m "chatly-backend project setup"
git branch -M main
git remote add origin https://github.com/OpeCoded/chatly-backend.git
git push -u origin main

- Note: we're going to have 3 environments (development i.e coding/local dev, staging i.e testing and production i.e live)
- main/master will be our production branch

So, on your github project create 2 new branches: development, staging
Set the development branch as default

Switch to development branch: git checkout development



 











