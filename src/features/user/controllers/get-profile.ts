import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@service/redis/follower.cache';
import { PostCache } from '@service/redis/post.cache';
import { UserCache } from '@service/redis/user.cache';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.service';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';

const PAGE_SIZE = 12;

/* interface to fetch all users */
interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const postCache: PostCache = new PostCache();
const userCache: UserCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();

/*
all: this method is used to get all users and those following the currently logged in user
newSkip: is the start value for pagination
skip,limit,newSkip: for pagination
allUsers: this gets user from cache and db based on type value
Get.prototype.followers: ref to the private method we created in this class
*/
export class Get {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const allUsers = await Get.prototype.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser!.userId}`,
    });
    const followers: IFollowerData[] = await Get.prototype.followers(
      `${req.currentUser!.userId}`
    );
    res.status(HTTP_STATUS.OK).json({
      message: 'Get users',
      users: allUsers.users,
      totalUsers: allUsers.totalUsers,
      followers,
    });
  }

  /*
profile: this method is used to get the profile of the currently logged user from the cache/DB
  cachedUser: gets the user from the cache, else fetch the DB

  */
  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      `${req.currentUser!.userId}`
    )) as IUserDocument;
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile', user: existingUser });
  }

  /*
  this method is used to fetch other users profile based on their ID
  */
  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      userId
    )) as IUserDocument;
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(userId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile by id', user: existingUser });
  }

  /*
  this method is used to fetch a user's profile and all post created by the user
  userName: converts the first letter in the username to uppercase
  cachedUser: gets the user from cache by the userId
  cachedUserPosts: gets the user post from cache
  'post': post key (collection) in the cache
  parseInt(uId): parsing the uId to int from string
  existingUser: getting user from DB by userId if not found in the cache
  userPosts: gets the post from DB by username, if nothing was returned from cache
  ({ username: userName }, 0, 100, {createdAt: -1}): ({QUERY CLAUSE}, PAGINATION, ORDER BY)
  */
  public async profileAndPosts(req: Request, res: Response): Promise<void> {
    const { userId, username, uId } = req.params;
    const userName: string = Helpers.firstLetterUppercase(username);
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      userId
    )) as IUserDocument;
    const cachedUserPosts: IPostDocument[] =
      await postCache.getUserPostsFromCache('post', parseInt(uId, 10));

    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(userId);
    const userPosts: IPostDocument[] = cachedUserPosts.length
      ? cachedUserPosts
      : await postService.getPosts({ username: userName }, 0, 100, {
          createdAt: -1,
        });

    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile and posts',
      user: existingUser,
      posts: userPosts,
    });
  }

  /*
  this method gets random users from the cache and DB for the currently logged in user
  randomUsers: empty list to hold random users
  (cachedUsers.length): checks if results were gotten from the cache, else fetch from the DB
  [...cachedUsers], [...users]: setting the results to the randomUsers empty list
  */
  public async randomUserSuggestions(
    req: Request,
    res: Response
  ): Promise<void> {
    let randomUsers: IUserDocument[] = [];
    const cachedUsers: IUserDocument[] =
      await userCache.getRandomUsersFromCache(
        `${req.currentUser!.userId}`,
        req.currentUser!.username
      );
    if (cachedUsers.length) {
      randomUsers = [...cachedUsers];
    } else {
      const users: IUserDocument[] = await userService.getRandomUsers(
        req.currentUser!.userId
      );
      randomUsers = [...users];
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User suggestions', users: randomUsers });
  }

  /*
  this method is used to get all users from the cashe or the db and the total count
  let users: used to hold users fetched
  cachedUsers.length: if at least one user was fetched from the user, set users to users fetched from cache
  cachedUsers: gets users from cache excluding the currently logged user
  user: gets users from DB excluding the currently logged user
  totalUsers: total number of users fetched based on type (i.e from cache or DB)
  */
  private async allUsers({
    newSkip,
    limit,
    skip,
    userId,
  }: IUserAll): Promise<IAllUsers> {
    let users;
    let type = '';
    const cachedUsers: IUserDocument[] = (await userCache.getUsersFromCache(
      newSkip,
      limit,
      userId
    )) as IUserDocument[];
    if (cachedUsers.length) {
      type = 'redis';
      users = cachedUsers;
    } else {
      type = 'mongodb';
      users = await userService.getAllUsers(userId, skip, limit);
    }
    const totalUsers: number = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }

  /* this method is used to get the number of users based on type i.e from cache and DB */
  private async usersCount(type: string): Promise<number> {
    const totalUsers: number =
      type === 'redis'
        ? await userCache.getTotalUsersInCache()
        : await userService.getTotalUsersInDB();
    return totalUsers;
  }

  /*
  this method is used to get the total number of followers of the currently logged in user
  userId: currently logged in user id
  result: fetch from db if no single data was found in the cache
   */
  private async followers(userId: string): Promise<IFollowerData[]> {
    const cachedFollowers: IFollowerData[] =
      await followerCache.getFollowersFromCache(`followers:${userId}`);
    const result = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowerData(
          new mongoose.Types.ObjectId(userId)
        );
    return result;
  }
}
