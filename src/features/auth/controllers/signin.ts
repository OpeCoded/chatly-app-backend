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
/* import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { IResetPasswordParams } from '@auth/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template'; */

/*
const { username, password }: destructuring or getting username and pass from the req sent to the server i.e post
existingUser: IAuthDocument: fetching a already registered user by username FROM the Auth Collection
passwordsMatch: checks if the password supplied during sign in matches with the one in the db
userJwt: the object here would be fetched AND a jwt session string (sign) is created  for this signed in user
res.status(HTTP_STATUS.OK): means 200 resp,

userId: this is the actual user created id, i.e in the user collection
userDocument: IUserDocument: holds an object of IUserDocument i.e all fields of a user instead of the IAuthDocument (which contains just id to avatar color). Now this new value will sent back to the client as json response instead of existingUser in the user: prop
...user: spreading all values/fields in the user var

mailTransport.sendEmail: sending an email after signing up
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
    /*
1. Test email sending after login
await mailTransport.sendEmail('antonietta.rice99@ethereal.email', 'Sign in request', 'You\'ve successfully logged into your account.');

2. Test sending password reset link template
existingUser.username!, resetLink: args required by template (i.e the content of the email sent)
addEmailJob: adds email to be sent (job) to the queue. With it's required args.

const resetLink = `${config.CLIENT_URL}/reset-password?token=0123456789`;
const template: string = forgotPasswordTemplate.passwordResetTemplate(
  existingUser.username!,
  resetLink
);
emailQueue.addEmailJob('forgotPasswordEmail', {
  template,
  receiverEmail: 'adriana.yost@ethereal.email',
  subject: 'Reset Password',
});

3. Test the confirm reset template (For confirmation email after password has been changed)
templateParams: this is the content of the email sent

const templateParams: IResetPasswordParams = {
  username: existingUser.username!,
  email: existingUser.email!,
  ipaddress: publicIP.address(),
  date: moment().format('DD/MM-YYYY HH:mm')
};
const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(
  templateParams
);
emailQueue.addEmailJob('forgotPasswordEmail', {
  template,
  receiverEmail: 'adriana.yost@ethereal.email',
  subject: 'Password reset confirmation',
});
*/

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
    res.status(HTTP_STATUS.OK).json({
      message: 'User signed in successfully',
      user: userDocument,
      token: userJwt,
    });
  }
}
