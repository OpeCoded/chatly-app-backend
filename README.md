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
interfaces: Interface is used for validating the structure (model) of an entity. An interface defines the syntax that any entity (e.g user, post) must adhere to. It's like a contract of how the data you want to define or the data you're expecting should look like.  
models: This is the structure of an entity (i.e a collection/table) - for mongoDB
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

Goto you tsconfig.ts file and define the absolute path for auth in the paths {} which will be used when importing
Create a file auth.schema.ts in the models dir (auth collection)
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
Send a request to the /signup endpoint in auth.http file
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
You will have to collections Auth and User, the Auth is contains auth credentials, while the user contains the user bio data but the authId is referenced in the User collection


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
git commit -m "Feature: Implemented Auth Feature"
git push origin feature/auth-feature => Creates a new branch "feature/auth-feature" NB: deny any prompt that comes
Visit the PR (Pull Request) link generated in the cmd i.e https://github.com/OpeCoded/chatly-app-backend/pull/new/feature/auth-feature
Click on Create PR > Merge Confirm



# BACKEND AUTH PASSWORD RESET

# MAIL TRANSPORT CLASS

We want to create methods that would be used to send emails on production and local development with different libraries for each.

Nodemailer (local)
Sendgrid (production)
ejs (email templating engine)


Switch to or create a new branch: git checkout -b feature/password-reset-feature
Install modules to send email: npm i nodemailer @sendgrid/mail ejs
Install the type declarations of the above

Goto .env and create the following keys:
SENDER_EMAIL
SENDER_EMAIL_PASSWORD
SENDGRID_API_KEY
SENDGRID_SENDER

Goto config.ts and define the properties of the above keys 

Create a file mail.transport.ts in shared > services > email
Import the required
Create an interface IMailOptions
Create a class MailTransport
Goto nodemailer.com/about to copy the required methods (reference)


# TEST DEV EMAIL SENDER

Goto ethereal.email to create an ethereal account in order to have a sender email and password
Paste the credentials in your .env file where appropriate
Start your server in cmd and run your app

- We want to test the developmentEmailSender while signing up (signin.ts controller)

Goto signin.ts, call mailTransport.sendEmail() after signing userJwt. Pass in 3 required args (sender email, subject, body)
- Note: use a wifi incase you're not receiving an email or try another network. Cus you have to be on the same network as the smtp server.
Goto auth.http , test your signin endpoint and see if an email would drop in the ethereal.email inbox


# EMAIL QUEUE AND WORKER

Objective: Add email (job) to queue => Worker then send the email

Create a file email.queue.ts in the queues dir
Create a class EmailQueue
Create a method addEmailJob, add it's interface to the BaseQueue (base.queue.ts)
Create email.worker.ts in the workers dir
Create a class EmailWorker
Goto email.queue.ts, call processJob()


# PASSWORD RESET TEMPLATES

Create a dir templates in service > emails
Create two dirs forgot-password, reset-password in the templates dir
Inside the forgot-password dir create a file forgot-password-template.ts and forgot-password-template.ejs
Copy and paste the snippets provided for forgot-password-template.ejs

Goto forgot-password-template.ts, Import the required
Create a class ForgotPasswordTemplate

Inside the reset-password dir create a file reset-password-template.ts and reset-password-template.ejs
Copy and paste the snippets provided for reset-password-template.ejs


# TEST EMAIL WITH PASSWORD RESET TEMPLATES

Goto signin.ts, create a var resetLink
Create a var template
Call emailQueue.addEmailJob()

- Test sending the email using your signin.ts controller. NOTE: to test, update the sender email and pass in your .env with the one you've sepecified for receiver. Else it won't deliver

For confirmation email after password has been changed
Install the following: npm i moment ip
Import them in signin.ts
Create a var templateParams
Call emailQueue.addEmailJob. Note: you can create a separate job for confirmation email but we used the addEmailJob


# FORGOT PASSWORD CONTROLLER METHOD

Create a file password.ts in the auth > controllers dir
Import the required
Create a class Password
Create a method create()
Create a method getAuthUserByEmail(), updatePasswordToken() in auth.service.ts
Goto authRoutes.ts, add /forgot-password and /reset-password/:token route to the routes()


# RESET PASSWORD CONTROLLER METHOD

This method will change the password and send a confirmation email that the user's password was changed

Goto password.ts
Create a method update()
- We want to check if the passwordRequestToken has not expired and if passwordResetToken exists
Goto a auth.service.ts, create a method getAuthUserByPasswordToken()
Goto authRoutes.ts, create a route for reset-password and pass the token param
Testing: Create a new request for routes /forgot-password and /reset-password in the auth.http file
Test the 2 new endpoints, copy token sent to the email and add it to the request to change the password


# JEST CONFIG

We want to setup our unit test using Jest, we'll be testing only our controller methods

Install Jest: npm install --save-dev jest
Install Jest types: npm i @types/jest, npm i @jest/types, npm i -D ts-jest

Create a file jest.config.ts in the root of the project
Import the required
Create a var config


# UNIT TEST SCRIPT COMMAND

Goto package.json, add "test" key to the scripts object

# AUTH UNIT TEST MOCK

PURPOSE OF TESTING: to check if we're getting the expected/correct response

- Test for sign up, we're going to be mocking data to be used for our tests, we won't be using real data from the DB. 

Create a dir test in the controllers dir
In the src dir, create a dir mocks
In the mocks dir, create a file auth.mock.ts - In here, we will mock our request and response data for sign up
Import the required
Create a func authMockRequest
Create a func authMockResponse


# SIGN UP UNIT TEST P1

We want to test if some required credentials values are not supplied when a user is trying to signup

Create a file signup.test.ts in the controllers > test dir 
Import the required
Create a jest describe()
To test, run: npm run test [this runs all test files in your source file]


# SIGN UP UNIT TEST P2

Use the it() to create other tests like we did above in part 1


# CLEAR MOCKS

We want to reset our mocks test before another test runs and clear all mocks after a test has finished

Goto signup.test.ts
Create a method beforeEach() in the describe()
Call resetAllMocks() inside it
Create a method afterEach()
Run npm run test [with the path of the test file]


# LOGIN UNIT TEST

We want to create a test for our sign.ts controller method

Create a file signin.test.ts in the test dir
Copy and paste the snippet provided
Run npm run test [with the path of the test file]


# PASSWORD RESET & LOGOUT UNIT TEST

Create a file password.test.ts, signout.test.ts in the test dir
Copy and paste the snippet provided
Run npm run test [with the path of the test file] to run individual test


# CURRENT USER UNIT TEST

Create a file user.mock.ts in the mocks dir

Create a file current-user.test.ts, signout.test.ts in the test dir
Copy and paste the snippet provided
Run npm run test [with the path of the test file] to run individual test


# PUSH CODE TO GITHUB

git add .
git commit -m "feature: implemented password reset feature with unit tests"



# BACKEND POST FEATURE


# SECTION INTRODUCTION


# POST INTERFACE, MODEL AND SCHEMA

Create a dir post in the feature dir
Add the path to the post dir to tsconfig.json, jestconfig.ts
Create the following dirs in the post dir controllers, interfaces, models, routes, schemes
Create a file post.interface.ts in post > interfaces dir
Create a file post.schema.ts in the post > models dir
- Copy and paste the snippets provided in the files above

Note: for schemas, you only add index: true to a field you're sure you're going to use to make a queries (i.e primary key)

# POST JOI VALIDATION SCHEME

Create a file post.schemes.ts in post > schemes dir
Copy and paste the snippet provided

- Note: we'll have 2 controllers for post upload. 
1. Post without image. 
2. Post with image


# SOCKECT IO POST HANDLER

We want to setup socketIO connection 
For immediate response from the server when a user makes a post

Create a file post.ts in shared > sockets
Import the required
Create a class SocketIOPostHandler

Goto setupServer.ts, inside socketIOconnections(), create a var postSocketHandler


# CREATE POST CONTROLLER METHOD

Create a file create-post.ts in post > controllers
Import the required
Create two method post, postWithImage


# SAVE POST TO REDIS CACHE

We want to save posts inside redis as a hash

Create a file post.cache.ts in shared > services > redis dir 
Import the required
Create a class PostCache
Create a method savePostToCache


# USE savePostToCache() inside create-post.ts controller

Goto create-post.ts
Create a var postCache
In the post(), call postCache.savePostToCache() and pass in the req args to be saved in the cache
Create a file postRoutes.ts in the post > routes dir
Create a class PostRoutes
Goto to the root routes.ts file and create a base path for postRoutes
TESTING:
Ensure you sign in a user before testing
Create a file posts.http in the endpoints dir
Send a request to this endpoint: POST {{baseUrl}}/{{urlPath}}/post


# ADD POST SOCKECT IO EVENT

We want to emit posts events in our post controller

Goto creat-post.ts, call socketIOPostObject.emit() in the post()


# POST QUEUE AND WORKER

Create a file post.queue.ts in service > queues
Create a class PostQueue
Add IPostJobData to the base queue
Create a file post.worker.ts in the workers dir
Create a class PostWorker
Create a file post.service.ts in the services dir
Create a class PostService
Createa a method addPostToDB
Goto post.worker.ts, call postService.addPostToDB inside the savePostToDB()
Goto create-post.ts controller, call postQueue.addPostJob() inside the post()


# POST WITH IMAGE CONTROLLER METHOD

Goto create-post.ts
Create a method postWithImage()
Goto postRoutes.ts, create a route for post/image/post


# CREATE POST UNIT TEST
 
Create a file post.mock.ts in the mocks dir
Copy and paste the snippet provided
Create a dir test in the post > controller dir
Create a file create-post.test.ts
Copy and paste the snippet provided


# GET POST FROM REDIS CACHE

We want to create methods to fetch get multiple posts, single posts etc

Post fetching: redis > mongodb

Goto post.cache.ts
Create a method getPostsFromCache()


# GET TOTAL POST COUNT FROM CACHE

Goto post.cache.ts
Export a type PostCacheMultiType


Create getTotalPostsInCache(), getPostsWithImagesFromCache(), getUserPostsFromCache()


# GET POST FROM MONGODB

Create a method getPosts(), postsCount()


# GET POST CONTROLLER 

Create a file get-posts.ts in controllers > post 
Import the required 
Create an instance of PostCache
Create a class Get
Create a method post(), postWithImages()


# GET POSTS ROUTES

Goto postRoutes.ts
Create get routes Get.prototype.posts, Get.prototype.postsWithImages

Goto post.http to test the endpoint Post get

# GET POST CONTROLLER UNIT TEST

Create a file get-post.test.ts in post > controller > test
Copy and paste the snippet provided
Run: npm run test <file-path>



# DELETE POST CONTROLLER 

We want to create a method to delete a post from redis cache for a particular user
We're going to delete the item from the set and hash


Goto post.cache.ts
Create a method deletePostFromCache()
Goto post.service.ts
Create a method deletePost()
Goto post.worker.ts
Create a method deletePostFromDB()
Goto post.queue.ts, add the job method deletePostFromDB() to the PostQueue class

Create a file delete-post.ts in the post > controller dir
Import the required
Create a class Delete
Create a method post()

Goto postRoutes.ts
Create a route delete()

Test in post.http


# DELETE POST CONTROLLER UNIT TEST

Create a file delete-post.test.ts in post > controller > test
Copy and paste the snippet provided
Run cmd: npm run test <file-path>


# UPDATE POST IN REDIS CACHE

Goto post.cache.ts
Create a method updatePostInCache()


# UPDATE POST CONTROLLER 

Goto post.service.ts
Create method editPost()
Goto post.worker.ts 
Create a method updatePostInDB()
Goto post.queue.ts
Add a job updatePostInDB to the queue
Create a file update-post.ts in post > controllers dir


# UPDATE POST WITH IMAGE CONTROLLER

Goto update-post.ts
Create a method postWithImage()
Create a private method updatePostWithImage(), addImageToExistingPost
Goto postRoutes.ts, create routes to update ordinary post and post with image i.e /post/image/:postId

Test in the posts.http


# UPDATE POST CONTROLLER UNIT TEST

Create a file update-post.test.ts in post > controllers > test

Copy and past the snippet code provided

<NOTE: in testing, ensure the status response in the controller tallies with the one in the test.ts file, else the test will fail


# PUSH CODE TO GITHUB

git checkout -b feature/post-feature
git add .
git commit -m "feature: added post features"
git push origin feature/post-feature
git push


# FIX TS CONFIG ISSUE

Goto tsconfig.json
Change the value of the rootDir to "." instead of "scr"



# NEW VIDEOS ADDED TO THE COURSE

# SECTION 3

# Update dependencies

- We want to update the libraries in package.json file, remove the ones not needed anymore.

Run npm update

Install package bullmq: npm i bullmq

# Update build script

ttypescript package converts an alias path to it's relative path, we want to use a better one which is tsc-alias.

npm uninstall ttypescript
npm install --save-dev tsc-alias
Update your package.json with this:   "build": "tsc --project tsconfig.json && tsc-alias -p tsconfig.json",
Run npm run build
 * check your build folder, you'd notice the tsc-alias package replaced alias paths (@user/) with relative paths (./../) after typescript compilation



 # SECTION 6


 # Update redis HSET method in post cache

HSET takes in 3 args in the new version of redis
HSET('key', 'field', 'value')

Convert your dataToSave from an array to an object, then loop through it to get each itemKey and itemValue then save to cache



# BACKEND POST REACTIONS FEATURE


# Reaction interface, model schema and joi schemes.

Create a new branch: git checkout -b feature/post-reactions-feature
Create a dir reactions in the features dir
Create the following dirs in the reactions dir: controllers, interfaces, models, routes, schemes.

Create respective files using the snippet provided for interfaces, models and schemes
Add the paths to the reaction feature in your tsconfig.json and jest.config.ts file


# Add post reaction to cache

Create a file reaction.cache.ts in services > redis
Create a method savePostReactionToCache()

# Remove post reaction from redis cache

Create a method removePostReactionFromCache()


# Add reaction controller

Create a file add-reactions.ts reactions > controllers dir
Create a class Add {}
Create a method reaction()
Create an instance of ReactionCache

Create a file reactionRoutes.ts in the reactions > routes dir 
Create a class ReactionRoute{}
Add reactionRoutes to the the base routes.ts file

Test the route in your endpoint
Create a file reactions.http
Test the post endpoint


# Fix add reaction issue

helpers.ts file parseJson()
Add this: return JSON.parse(prop);


# Add post reaction to mongodb

Create a file reaction.service.ts in db dir
Create a class ReactionService
Create a method addReactionDataToDB()

# Post reaction queues and worker

Create a method removeReactionDataFromDB()

Create a new file reaction.queue.ts in the queues dir
Create a method addReactionJob()
Add IReactionJob to the base.queue.ts file
Create a file reaction.workers.ts in the workers dir
Create class ReactionWorker
Create a method addReactionToDB(), removeReactionFromDB()

Create a fresh post and try to add reaction to it
Test in your reaction.http endpoint
Check your redis and DB to ensure all works


# Fix add reaction to mongodb error

While creating our reactioinObject in add-reactions.ts, we're creating our own reaction id where as mongodb will also create another one for us. So by the time a user wants to update his/her reaction a new reaction id is being created which causes conflict.

_id: new ObjectId()

- solution:

Goto reaction.service.ts
Import omit 


# Remove reaction controller

Create a new file remove-reation.ts in the controllers dir
Create a class Remove
Create a delete route in the reactionRoutes.ts

Create your DELETE endpoint in the reactions.http file for testing


# Add and Remove reaction controllers unit test

* Hint: test files gives you an overview of what data or values is being processed by your controller

Create a file reactions.mock.ts in the mocks dir
Copy and paste the snippet code provided
Create a file add-reactions.test.ts, remove-reactions.test.ts in features > reactions > controllers > test dir
Run npm run test <test-file-path>

# Get post reactions from redis cache and MongoDB

Goto reaction.cache.ts
Create a method getReactionsFromCache()
getSingleReactionByUsernameFromCache()


# Get post reactions from mongoDB

Goto reaction.service.ts
Create a method getPostReactions()Create a method getSinglePostReactionByUsername()Create a method getReactionsByUsername()


# Get reactions controller

Create a file get-reactions.ts in feature > reactions > controllers dir
Create a class Get
Create a method reactions()
Create a method singleReactionByUsername(), reactionsByUsername()


# Get reactions routes

Add all the get routes in reactionRoutes.ts

Test the endpoint in your reactions.http


# Get reactions controller unit test

Create a file get-reactions.test.ts
Copy and paste the snippet provided

Run: npm run test <test-file-path>

# Push code to github

git add .
git commit -m "feat: implemented post reactions feature"

Create a PR and Merge

git checkout development
git pull


# BACKEND COMMENTS FEATURES

# Comment Interface, Model and Joi Schema

Create a folder comments in the features dir and all relevant directories in it

* Ensure you create the absolute path in tsconfig.json and jest.config.ts file

Create the interfaces, models, routes and schemes for comments

Copy and paste the snippet files provided in each files in the dirs above

* Ensure you create the absolute path in tsconfig.json



# Comment redis cache methods part 1

Create a file comment.cache.ts in services > redis dir
Create savePostCommentToCache(), getCommentsFromCache()

# Comment redis cache methods part 2

Create methods getCommentsNamesFromCache(), getSingleCommentFromCache()


# Comment SocketIO Event

We want to listen to 2 socketIO events coming from the client side and then emit (invoke) 2 other events for both reactions and comment feature


Goto shared > sockets > post.ts
In the listen(), listen to events and emit them back to the client

Ensure the sockect (e.g SocketIOPostHandler) you're listening to is added to your sockectIOConnections() in the setupServer.ts file 


# Comments Service Part 1

Create a file comment.service.ts in the services > db dir  
Create a class CommentService
Create a method addCommentToDB(), getPostComments(),getPostCommentNames()


# Comments Queue and Workers

Create files comment.queue.ts, comment.worker.ts
Add the respective job types to your base queue


# Add comment controller

Create a file add-comment.ts
Create a class Add
Create a method comment()


# Get comment controller

Create a file get-comments.ts
Create a class Get
Create methods comments(), commentsNamesFromCache(), singleComment()
Create a file commentRoutes.ts in the feature comments > routes dir
Add commentRoutes to main route file routes.ts


# Test comment feature

Create comments.http
Test your endpoints


# Comment controller unit tests

Create files add-comment.test.ts, get-comments.test.ts 

Goto reactions.mock.ts, create var  commentsData to mock our comment feature


# 9 Backend Followers, Following, Block and Unblock Features


# Follower Interface, Model Schema.

Create a new dir followers in the features dir
In it, create the relevant dirs controllers, interfaces, models and routes and corresponding files.

Add the typescript path transform to tsconfig.json and jest.config.ts file

Note: this feature doesn't require schemes BECAUSE the data we'll be sending in this feature will be sent via req.params not req.body

Hence, we only use validators (schemes) when using req.body.

Before you start, create a new branch for this feature

git checkout -b feature/followers-feature

# Follow data structure

# Save following follower to redis cache

Create a file follower.cache.ts in the redis dir
Create methods saveFollowerToCache(), removeFollowerFromCache(), updateFollowersCountInCache(), getFollowersFromCache()


# Add follower controller part 1

Create a file follow-user.ts
Create a method follower()
userData()

# Add follower controller part 2

Create a file follower.ts in the sockets dir
Goto setupServer.ts inside the socketIOConnections {}, add the SocketIOFollowerHandler

Create your route file followerRoutes.ts
Add this new route to the base route file routes.ts
Create follower.http in the endpoints dir
Test the put endpoint 

# Follower service part 1

Create a file follower.service.ts 
Create a method addFollowerToDB()


# Follower service part 2

Create a method removeFollowerFromDB()
Create a file follower.worker.ts
Create a file follower.queue.ts
Add the queue created to your base.queue.ts
Goto follower-user.ts i.e controller
invoke the followerQueue


# Unfollow user controller

Create a file unfollow-user.ts
Create a method Remove
Create a method follower()
Create the route to unfollow a user in the followerRoutes.ts file
Test in your endpoint


# Follow and unfollow user unit tests

Create a file followers.mock.ts
Copy the snippets provided
Create follower-user.test.ts
Create unfollow-user.test.ts
Run the test



# Get followers from redis cache

In the cache
followers: #userId {...}, we want to get all items i.e followers in a particular hash

Create a method getFollowersFromCache()

# Fix auth bug


# Get followers from mongoDB

Goto follower.service.ts
Create a method getFolloweeData(), getFollowerData()


# Get followers controller

Create a file get-followers.ts
Create methods userFollowing(), userFollowers()
Add the routes methods and respective controller method in your followerRoutes.ts file
Test the endpoints in follower.http

# Block user redis cache method

Goto follower.cache.ts
Create a method updateBlockedUserPropInCache()


# Block user mongodb method

Create a file block-user.service.ts in service > db dir
Create a class BlockUserService
Create a method blockUser()
Create a method unblockUser()
Create files blocked.queue.ts, blocked.worker.ts


# Block and Unblock user controller

Create a file block-user.ts in features > followers > controllers 
Create a method block()
Add the route for block/unblock feature to followerRoutes.ts

# User socket IO handler

Create a file user.ts in the sockets dir to listen for events and emit them
Goto setupServer.ts, add SocketIOUserHandler and listen to userSocketHandler

# Unit Tests 

Add required tests in the followers > controllers > test dir

# Push code to github