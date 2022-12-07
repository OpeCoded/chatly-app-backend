# SOCIAL NETWORK MERN - UZOCHUKWU EDDIE ODIZI

# MY TERMS

A constructor is a special function that creates and initializes an object instance of a class. In JavaScript, a constructor gets called when an object is created using the new keyword.



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

Switch to development branch: 
git fetch
git checkout development


# CHANGE ABSOLUTE IMPORTS

We want to change paths for our imports to use absolute paths e.g @shared/routes.ts

Install these two libraries: npm i ttypescript typescript-transform-paths
- ttypescript module: we'll use to build our typescript app instead of the tsc command, else we'll get errors while building our app because we changed our paths to absolute
- typescript-transform-paths module: will help us to transform the absolute paths we created to regular paths in our build file
Goto tsconfig.json, add a plugins: key. Add typescript-transform-paths in the objects
Add a paths: key, in here we specify our absolute paths. Note: "@root/*" path should be the last in the object

Goto previous files you've create and put the absolute paths in use by changing the import paths 


# BUILD SCRIPT

We want to add the build command to build our app

Goto .gitignore, .eslintignore add build
Goto package.json, in the scripts object add a new command/key "build". This will help us to convert our project from typescript to javascript
Run npm run build: to build our app


# 4. BACKEND AUTHENTICATION FEATURE


# REDIS COMMAND

- Redis datatypes

Strings
Lists
Sets: an unordered list of data
Hashes: are objects, with fields (keys) and values
Sorted Sets: ordered or grouped list of data

- Redis Commands

List Commands 

LPUSH : prepends values at the beginning of a list (Left)
LRANGE: used to get a range of elements from a list
LINDEX: gets an element from a list by its index
LLEN: gets the length of a list
LREM: removes an element from a list
LSET: sets the value of an element in a list by it's index
RPUSH: appends one or more values to a list from the Right

*started making screenshots from here



# CLOUDINARY UPLOAD FUNCTION 

Login to your cloudinary dashboard
Copy your cloudname, api key and api secret.
Add them to you .env file AND config.ts (class and constructor) file

Install cloudinary: npm install cloudinary
Goto config.ts, Import cloudinary 
Create a method cloudinaryConfig
Goto app.ts, inside the loadConfig(), call cloudinaryConfig()

Inside src > shared > globals > helpers, create a file cloudinary-upload.ts
Import cloudinary, UploadApiResponse , UploadApiErrorResponse
Create a function uploads()


# AUTH VALIDATION SCHEMES

- Validation schemas for sign up and password reset
- Joivalidation module for form validation 
- * later, we'll create a TS decorator, based on the decorator our validations will be performed based on the data sent through the request body 

Install Joi: npm i joi
In the features dir, create a new dir auth

Inside the auth dir create the following dir:

controllers: this will contain the business logic
interfaces: is like a contract of how the data you want to define or the data you're expecting should look like
models: model for mongoDB
routes: routes/urls for auth
schemes: schemes for validation during sign up

In the schemes dir, create files signup.ts, signin.ts (copy and paste the file provided)


# JOI VALIDATOR DECORATOR
A decorator is like a spacial declaration that can be attached to a class/method

- We want to create a typescript decorator that will be used to perform validations using joi validation module. In this case to validate our req.body properties

Create a new branch for our auth-feature: git checkout -b feature/auth-feature [everything related to auth will be in this branch]
Inside src > shared > globals create a decorators dir 

Inside the decorators dir, create a file joi-validation.decorators.ts
Import JoiRequestValidationError, Request, ObjectSchema

Create a type IJoiDecorator
Create a func joiValidation


# AUTH INTERFACE AND MODEL SCHEMA (dir: scr/features/auth)

We want to create our interfaces and model user authentication features

Create a file auth.interface.ts in the interfaces dir
Copy and paste the file you were provided with 

Goto you tsconfig.ts file and define the absolute path for auth in the paths {}
Create a file auth.schema.ts in the models dir
Copy and paste the file you were provided with 

Install bycryptjs: npm i bcryptjs
Install it's file declaration type: npm i --save-dev @types/bcryptjs

# SIGN UP USER METHOD PART 1 (SignUp Controller)

We want to create a method to create a user > add the user to redis cache > save the user to MongoDB

Install modules: npm i jsonwebtoken lodash
Install their types: npm i --save-dev @types/jsonwebtoken @types/lodash

Create a file signup.ts in features/auth/controllers
Import ObjectID (mongodb id to be saved to the db), request and response
Create a class SignUp, inside the class create a method create()

- To check if a username and email already exist we need to create a service

Create a file auth.service.ts in shared > services > db
Create a class AuthService, create a method getUserByUsernameOrEmail

Create a file helpers.ts in src > shared > globals > helpers


# SIGN UP USER METHOD PART 2 (SignUp Controller)

Create a method signUpData

# AUTH ROUTES

Create a file authRoutes.ts in features/auth/routes
Import the required
Create a class AuthRoutes
Goto project routes.ts file, Create var BASE_PATH
Add the authRoute to the route()

Use Rest Client VSCode extension to test the endpoint:
Create a dir endpoints in the root of the project
Create a file auth.http in it (this will house all endpoints for our authentication requests)

Define baseUrl and urlPath
Define a post req to create a user

Start your redis server, mongo db and run your app
Click send request in the auth.http file
If your req was successful, you picture would be uploaded to cloudinary


# USER INTERFACE AND MODEL SCHEMA

How users created would be saved to mongo db in terms of data types

Create a dir user in the features dir
Inside the user dir, create dirs models, interfaces

Create a file user.interface.ts in the interfaces dir 
Copy and paste the file you're provided with 

Create a file user.schema.ts in the model dir 
Copy and paste the file you're provided with 


# REDIS BASE CLASS
We want to save frequently used/accessd data by users in our app in the redis-cache to speed up data retrieval instead of waiting for data to be fetched from the db, so we want to setup our redis connection 

Goto shared > services > redis
Create a file base.cache.ts, Import the required
Create a class BaseCache
Create a file redis.connection.ts, Import the required
Create a class RedisConnection
Goto setupDatabase.ts, call redisConnection.connect(); in the .then()

Run your app: you should have Redis connection: PONG in the log


# SAVE USER TO REDIS CACHE PART 1

Create a file user.cache.ts in the redis dir
Import BaseCache
Creat a class UserCache
Create a method saveUserToCache


# SAVE USER TO REDIS CACHE PART 2

Goto signup.ts in the controllers dir
Create a method userData
Create an instance of UserCache() on top of the file
In the create(), call saveUserToCache(..pass in args) to add user to redis cache


# INSTALL REDIS COMMANDER (GUI FOR REDIS)

Install: npm install -g redis-commander
Ensure redis-server is running on your machine
Run: redis-commander in terminal
Start your app: npm run dev
Using your endpoint auth.http req file, try to create a new user and check if it's in redis db


# BASE MESSAGE QUEUE

We want to create queues and workers which will be used in sending data to our mongodb

Queue => Worker => MongoDB

Bull is used to create  queues and workers
Install bull: npm install bull --save
Install bull GUI modules: npm i @bull-board/express @bull-board/ui

Create a file base.queue.ts in the services/queues dir
Import the required
Create vars bullAdapters, serverAdapter
Create a class BaseQueue

 
 # BASE QUEUE ADD JOB METHOD

Methods to add data to the queue and process jobs inside the queue

Create a method addJob(), processJob()
Goto routes.ts, add the /queues basepath to the routes(). This will allow us to see our jobs in the Bull GUI
Before testing, create atleast a queue

Create a file auth.queue.ts in the shared > services > queues dir
Create a class AuthQueue, 
Goto base.queue.ts, create a type IBaseJobData
Pass the IBaseJobData as data: in the addJob()
Goto signup.ts in the controllers dir
Import omit, use omit() to remove props we don't want to save to the mongo db
Use authQueue.addAuthUserJob (AuthQueue class) to add the user data created to the queue as a job
Cmd: npm run dev
Goto Bull Dashboard: localhost:5000/queues


# AUTH QUEUE AND WORKER
- Use the auth queue for explanations

We want to create a worker that will process the jobs, send it to a method that will add the data to mongodb

- Saving a user to cache 

Create a file auth.worker.ts in the shared > workers dir
Import the required
Create a class AuthWorker, Create a method addAuthUserToDB()
Goto auth.service.ts, create a method createAuthUser
Goto auth.worker.ts call createAuthUser() in the addAuthUserToDB()
Goto auth.queue.ts, in the constructor() call the processJob() and passing the required values

- Saving a user to mongodb 

Create a file user.worker.ts in the workers dir (you can duplicate the auth.worker.ts and make changes) 

Create a file user.service.ts in service > db dir
Create a class UserService
Goto user.worker.ts,  call userService.addUserData in the addUserToDB()
Create a file user.queue.ts in the shared > services > queues dir (you can duplicate the auth.queue.ts)
Goto controllers > signup.ts, call userQueue.addUserJob() in the create method


# ADD JWT TO SESSION

We want to add JWT using our session using cookie session module

Goto signup.ts (controller)
Create a method signToken(), Import JWT
In the create() create a var userJwt, req.session


# VIEW MONGO DB DATA WITH COMPASS

Run your request to create a new user in the auth.http file
Check your mongodb compass, you will see you db has been created with the name you specified in your .env file for DB_URL
You will have to collections Auth and User, the Auth is contains auth credentials, while the user contains the user bio data but the authId is referencec in the User collection


# USER LOGIN CONTROLLER
- Note: this looks like the signup section, so check sign up comments for explanations

We want to implement the sign in / login feature

Goto feature > auth > controllers 
Create a file signin.ts, create a class SignIn
Create a method read(), import the required
Create a method getAuthUserByUsername in auth.service.ts
Goto authRoutes.ts, create the signin route in the routes()
Goto auth.http, create a request for signin pointing to /signin route
Test it

# FIX LOGIN BUG

Initially we're passing the id of a user in the Auth collection to userId while signing JWT which is wrong, so we want to pass the actual id created in the User collection in MongoDB

Goto user.service.ts, Create a method getUserByAuthId()
Goto signin.ts, create a var user, pass it to JWT.sign()

# UPDATE LOGIN CONTROLLER

Goto singin.ts, create a var const userDocument: IUserDocument, pass userDocument in the res.status() for user


# USER LOGOUT CONTROLLER

Create a file signout.ts in features > auth > controllers
Import the required
Create a class SignOut, create method update()
Goto authRoutes.ts, Create a method signoutRoute()
Goto routes.ts (root), create the base path for signoutRoute()
- To test:
Goto auth.http, create a get req pointing to the /signout route


# GET USER DATA FROM REDIS CACHE

We want to create a controller to check if the current user is a valid user and has a valid user token

We need 2 methods: Method to get the user data from the cache (using HGETALL)
- hgetall users:638cf42cf6ac60372572885c
And the other method, from the database

Note: while saving data to the cache, we stringify them using JSON.stringify, so we need to convert them back to json using json.parse

Goto globals > helpers > helper.ts
Create a method parseJson()
Goto user.cache.ts, create a method getUserFromCache()


# GET USER FROM MONGODB BY ID PART 1

Goto shared > services > db > user.service.ts
Create a method getUserById()


# GET USER FROM MONGODB BY ID PART 2

Continued - getUserById()
Create a method aggregateProject()


# CURRENT USER CONTROLLER

Create a file current-user.ts in features > auth > controllers
Create a class CurrentUser
Create a file currentRoute.ts in controllers > routes
Create a class CurrentUserRoutes
Goto the root routes.ts file, create a base path for /currentuser route


# AUTHENTICATION MIDDLEWARE

We want to create 2 middleware methods to set the currentUser value or payload (auth.interface.ts) i.e init value

First middleware verify if the user token (JWT) is valid before an auth req is being sent: verifyUser()
Second middleware verifies if the currentUser actually exists: checkAuthentication()

Create a file auth-middleware.ts in the globals > helpers dir
Import the required
Create a class AuthMiddleWare
Create a method verifyUser()
Goto currentRoute.ts, add authMiddleware.checkAuthentication in the route path for ocurrentuser
Goto routes.ts (root), add authMiddleware.verifyUser to the currentUserRoutes base path
Goto auth.php file, test the /sigin,  /currentuser endpoints respectively


# MERGE FEATURE BRANCH TO DEVELOP

We want to push what we have done so far (our code), create a pull request and merge it to development.

Run the below CMDs:

npm run lint:check => This checks for lint errors
npm run prettier:check
npm run prettier:fix => This fixes all prettier errors
git add .

