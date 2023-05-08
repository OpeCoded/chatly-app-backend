import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { CommentCache } from '@service/redis/comment.cache';
import { commentService } from '@service/db/comment.service';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();

export class Get {

  /*
  comments: method to get all comments associated with a postId.. from cache > db
  cachedComments: comments fetched from cache
  comments: comments fetched from the db if the lenght of cachedComments is 0
  { createdAt: -1 }: sort prop desc
  */
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  /*
  commentsNamesFromCache: fetches the names of those who made comment to a post
  commentsNames[0]: response is the first item in the list returned

  */
  public async commentsNamesFromCache(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
    const commentsNames: ICommentNameList[] = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
  }

  /*
  singleComment: fetches a single comment using postId and commentId
  comments[0]: response is the first item in the list returned
  Note: only commentId is req to fetch from the comments collection in the DB
  */
  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
  }
}
