import { IUserDocument } from '@auth/interfaces/user.interface';
import { UserModel } from '@auth/user/models/user.schema';
import { IPostDocument, IGetPostsQuery, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { Query, UpdateQuery } from 'mongoose';

/*
post: post to be saved to the db
user: this updates a user's post count prop
$inc: mongodb increment operator
Promise.all: combining await when we have multiple async funcs to call
([post, user]): which then executes the vars sequentially
*/

class PostService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }

  /*
  getPosts: gets all posts from mongoDB
  query: query statement
  skip, limit: used for pagination
  Record<string, 1 | -1>: sort in order ASC | DESC
  query?.imgId && query?.gifUrl: setting query to use (dynamic query) if media files are present in the query
  postQuery: holds our query statement for media files posts
  postQuery => { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] }: fetch posts where imgId OR gifUrl is not empty
  $or: OR operator
  $ne: NOT EQUAL TO
  posts: fetches posts using postQuery statement
  $match: fetches the documents that match the specified postQuery statement
  aggregate: process the data records/documents and return computed results
  */
  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else {
      postQuery = query;
    }
    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  }

  /*
  postsCount: gets the total number of posts docs in our posts collection
  */
  public async postsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }


  /*
  deletePost: deletes a post from mongo db
  deletePost: query statement to delte a post from mongodb
  { _id: postId }: field to delete and : value
  decrementPostCount: decrements post count for a particular user
  $inc: increment operator
  */
  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    // delete reactions here
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementPostCount]);
  }



  /*
  editPost: updates a post
  $set: used to update an object in the db
  */
  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    await Promise.all([updatePost]);
  }
}

export const postService: PostService = new PostService();
