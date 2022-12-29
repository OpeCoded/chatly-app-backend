import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@auth/user/interfaces/user.interface';

/*
passwordResetConfirmationTemplate: this renders the template for the email that would be sent to the user after successfuly changing their password
username,email,ipaddress,date,image_url: props to render in the template
*/

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
