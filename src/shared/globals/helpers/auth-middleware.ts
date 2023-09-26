import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

/* 
verifyUser(): verifies if the user jwt exists and valid
(!req.session?.jwt): if no jwt is found in the session when a request is made
payload: AuthPayload: checking if the jwt is valid. If it is valid it will return the userJwt props{} and values saved in the userJwt in signin.ts 
as AuthPayload: casting as AuthPayload, just like Alias
req.currentUser: setting the value of currentUser
_res: underscore res because we're not using it 

checkAuthentication(): checks if the currentUser exists, this method is going to be added to routes that are required after the user logs in
*/
export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again.'
      );
    }

    try {
      const payload: AuthPayload = JWT.verify(
        req.session?.jwt,
        config.JWT_TOKEN!
      ) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please login again.');
    }
    next();
  }

  public checkAuthentication(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError(
        'Authentication is required to access this route.'
      );
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
