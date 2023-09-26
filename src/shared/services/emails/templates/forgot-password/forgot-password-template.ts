import fs from 'fs';
import ejs from 'ejs';

/*
passwordResetTemplate: renders the email template with content when user clicks on forgot password
username, resetLink, image_url: props to be rendered inside the template
*/

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string): string {
    return ejs.render(
      fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'),
      {
        username,
        resetLink,
        image_url:
          'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png',
      }
    );
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate =
  new ForgotPasswordTemplate();
