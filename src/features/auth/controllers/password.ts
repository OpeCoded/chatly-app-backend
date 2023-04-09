import { Request, Response } from 'express';
import { config } from '@root/config';
import moment from 'moment';
import publicIP from 'ip';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@auth/user/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { BadRequestError } from '@global/helpers/error-handler';


/*
create: controller method to request password reset
@joiValidation(emailSchema): decorator validator to validate email of the user
{ email }: destructuring the email from the req body
existingUser: checks if a user exists with the email in the request body
randomBytes: used to create a buffer (a pool of random data)
randomCharacters: used to convert the buffer to string
Date.now() * 60 * 60 * 1000: valid for 1hr
resetLink: link to reset password sent via email
template: email template/format
emailQueue.addEmailJob: add email job to the queue
forgotPasswordEmail: emailQueue job name


{ password, confirmPassword }: destructuring them from the req body
{ token }: destructuring the randomCharacters (token) created from above from the req params, cus we will send it along with the request as a param in the route

@joiValidation(passwordSchema): decorator validator to validate password of the user
existingUser.password = password: setting/updating the new password of the user in the db
existingUser.save(): saving/updating the new props value in the db

templateParams: content of the email to be sent
template: email template to be used
emailQueue.addEmailJob: sending the email job
*/

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('No user with such Email in our records.');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }


  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired.');
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
