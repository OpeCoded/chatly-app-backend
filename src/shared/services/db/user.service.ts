import {
  IBasicInfo,
  ISearchUser,
  IUserDocument,
  ISocialLinks,
  INotificationSettings,
} from '@auth/user/interfaces/user.interface';
import { UserModel } from '@auth/user/models/user.schema';
import mongoose from 'mongoose';
// import { indexOf } from 'lodash';
// import { followerService } from '@service/db/follower.service';
import { AuthModel } from '@auth/models/auth.schema';
import { followerService } from './follower.service';
import { indexOf } from 'lodash';

/*
addUserData: this adds a user to the mongo db

getUserByAuthId: this gets a user from the User collection by it's auth id (from Auth collection)
$lookup: used to search/reference authId from the Auth collection to the _id in the User collection

aggregate(): used to fetch data based on some conditions e.g id. It works like findById(), findByOne() methods of mongodb, but it's more efficient and gives room to manipulate data how one wishes.
The aggregate method always returns a list
mongoose.Types.ObjectId(userId): casting userId val to mongoose object id, esle it won't be found if left as string.
as: 'authId': Alias for the properties that would be returned after lookup unwinds, so we can access them with $authId.something
{ $unwind: '$authId' }: make the value of a lookup as an object
$project: property is used to return fields you want
aggregateProject(): is used to specify the fields we want to return. To exclude a field, set it to 0 instead of 1
'$authId.username': means unwind.username i.e the object returned after lookup

users[0]: aggregate() method returns results as a [] list, so [0] means getting the first element (user) returned
users[0]: returns only one item
*/

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  /*
  updatePassword: used to update user password
  { username }: where condition
  $set: update the new value to the DB
  password: field to update
  */
  public async updatePassword(
    username: string,
    hashedPassword: string
  ): Promise<void> {
    await AuthModel.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    ).exec();
  }

  /* 
  updates the basic info of a user in the DB
  { _id: userId }: field to update based on _id match
  $set: new values to update with 
  */
  public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          work: info['work'],
          school: info['school'],
          quote: info['quote'],
          location: info['location'],
        },
      }
    ).exec();
  }

  /* 
  used to update the social links of the user
  social: links:  FIELD, VALUE TO UPDATE
  */
  public async updateSocialLinks(
    userId: string,
    links: ISocialLinks
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { social: links },
      }
    ).exec();
  }

  /* 
  updateNotificationSettings: updates the notification setting of users
  */

  public async updateNotificationSettings(
    userId: string,
    settings: INotificationSettings
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { notifications: settings } }
    ).exec();
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authId',
        },
      },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users[0];
  }

  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authId',
        },
      },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users[0];
  }

  /*
  getAllUsers: this method is used to get all users in the DB
  userId: currently logged in user, skip: for pagination, limit: nos. of records to display
  users: query to get all user
  $ne: NOT EQUAL, fetches all the docs that doesn't macththe currently logged in userId
   mongoose.Types.ObjectId(userId): casting the userId passed in from string to ObjectId
   localField: 'authId': id on User collection
   foreignField: '_id': id on Auth collection
   as: 'authId': returns the results as authId
   NOTE: $lookup returns an array, and we're also fetching multiple items, so it's going to be and array inside and array [
    []
   ], so we use the $unwind operator
  */
  public async getAllUsers(
    userId: string,
    skip: number,
    limit: number
  ): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authId',
        },
      },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() },
    ]);
    return users;
  }

  /*
  this method gets random users from the db
  userId: currently logged in user
  randomUsers: list to hold random users
  users: gets all users when the users id (i.e _id) != the userId passed in
  $lookup: to gain access to other fields related to users in the Auth Collection
  $sample: number of docs to return
  $addFields: new users fields we bring in from the Auth Collection, all other fields will come from the Users Collection by the help of aggregateProject() defined below
  { $unwind: '$authId' }: make the value of the lookup as an object, so we can say .dot something
  $project: used to omit the props we don't want to return by setting it to 0, esle 1 if we need them.

  (const user of users): looping through random users []
  NOTE: follower her should be followeer
  followerIndex: the index of the followee coming from the followers[]
  (followers, user._id.toString()): INDEX, VALUE
  (followerIndex < 0): the followee is not following the currently loggged in user
  randomUsers.push(user): add the follower to the randomUsers[]
  */
  public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authId',
        },
      },
      { $unwind: '$authId' },
      { $sample: { size: 10 } },
      {
        $addFields: {
          username: '$authId.username',
          email: '$authId.email',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          createdAt: '$authId.createdAt',
        },
      },
      {
        $project: {
          authId: 0,
          __v: 0,
        },
      },
    ]);
    const followers: string[] = await followerService.getFolloweesIds(
      `${userId}`
    );

    for (const user of users) {
      const followerIndex = indexOf(followers, user._id.toString());
      if (followerIndex < 0) {
        randomUsers.push(user);
      }
    }
    return randomUsers;
  }

  /*
getTotalUsersInDB: this method gets the total number of users in the User collection
   */
  public async getTotalUsersInDB(): Promise<number> {
    const totalCount: number = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  /*
  searchUsers: this method is used to search a particular user
  regex: this method takes in a regex as an arg
  users: queries the Auth collection for a match where username field is equal to the regex arg
  $lookup: makes a ref to the User collection to get all other info of a user
  localField: '_id': is in the Collection we're quering from i.e Auth Collection
  foreignField: 'authId': field to match in the User collectoin
  as: 'user': lookup result variable name
  { $unwind: '$user' }: makes the result of the lookup an object
  $project: collating data we need after the lookup
  */

  public async searchUsers(regex: RegExp): Promise<ISearchUser[]> {
    const users = await AuthModel.aggregate([
      { $match: { username: regex } },
      {
        $lookup: {
          from: 'User',
          localField: '_id',
          foreignField: 'authId',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$user._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1,
        },
      },
    ]);
    return users;
  }

  /* this are the results we want to send back to the client after the fetching */
  private aggregateProject() {
    return {
      _id: 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1,
    };
  }
}

export const userService: UserService = new UserService();
