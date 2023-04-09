import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { ReactionCache } from '@service/redis/reaction.cache';
import { reactionService } from '@service/db/reaction.service';
import mongoose from 'mongoose';

const reactionCache: ReactionCache = new ReactionCache();

/*
reactions: method to get all reactions for a particular post
cachedReactions: reactions saved in the redis cache
cachedReactions[0].length?: if the first item in the cachedReactions is > 0 then there's a reaction found, so return the cachedReactions ELSE fetch reaction from the DB
mongoose.Types.ObjectId(postId): casting the postId param string we want to use to fetch reaction as ObjectId
{createdAt: -1}: sorting by date create, -1 is desc order
count: reactions[1]: just like reaction.length
count: is the number of result returned
*/
export class Get {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReactions: [IReactionDocument[], number] =
      await reactionCache.getReactionsFromCache(postId);
    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getPostReactions(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );
    res.status(HTTP_STATUS.OK).json({
      message: 'Post reactions',
      reactions: reactions[0],
      count: reactions[1],
    });
  }

  /*
  singleReactionByUsername: method to fetch post reactions of a user using  username
  */
  public async singleReactionByUsername(
    req: Request,
    res: Response
  ): Promise<void> {
    const { postId, username } = req.params;
    const cachedReaction: [IReactionDocument, number] | [] =
      await reactionCache.getSingleReactionByUsernameFromCache(
        postId,
        username
      );
    const reactions: [IReactionDocument, number] | [] = cachedReaction.length
      ? cachedReaction
      : await reactionService.getSinglePostReactionByUsername(postId, username);
    res.status(HTTP_STATUS.OK).json({
      message: 'Single post reaction by username',
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0,
    });
  }

  /*
reactionsByUsername: gets all reactions made by a user irrespective of the post (all post)
  */
  public async reactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const reactions: IReactionDocument[] =
      await reactionService.getReactionsByUsername(username);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'All user reactions by username', reactions });
  }
}
