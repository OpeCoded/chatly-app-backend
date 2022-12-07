import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@auth/user/interfaces/user.interface';

/*
const { username, password }: destructuring or getting username and pass from the req sent to the server i.e post
existingUser: IAuthDocument: fetching a already registered user by username FROM the Auth Collection
passwordsMatch: checks if the password supplied during sign in matches with the one in the db
userJwt: the object here would be fetched AND a jwt session string (sign) is created  for this signed in user
res.status(HTTP_STATUS.OK): means 200 resp,

userId: this is the actual user created id, i.e in the user collection
userDocument: IUserDocument: holds an object of IUserDocument i.e all fields of a user instead of the IAuthDocument (which contains just id to avatar color). Now this new value will sent back to the client as json response instead of existingUser in the user: prop
...user: spreading all values/fields in the user var
*/

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(
      username
    );
    if (!existingUser) {
      throw new BadRequestError('User with such username was not found!');
    }
    const passwordsMatch: boolean = await existingUser.comparePassword(
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Password mismatch or incorrect!');
    }

    const user: IUserDocument = await userService.getUserByAuthId(
      `${existingUser._id}`
    );

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;
    res
      .status(HTTP_STATUS.OK)
      .json({
        message: 'User signed in successfully',
        user: userDocument,
        token: userJwt,
      });
  }
}
