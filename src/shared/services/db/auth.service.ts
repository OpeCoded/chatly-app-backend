import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

/*
AuthService: this will be used to compare entries made by users during any auth feature
getUserByUsernameOrEmail: this queries the db to compare if username/email already exists
user: IAuthDocument: finding if a user exist with the username / email entered
$or: or operator i.e find username or email

createAuthUser: creates a user in the mongodb
getAuthUserByUsername: this fetches a user by username during sign in
getAuthUserByEmail: gets a user user by email
updatePasswordToken: this updates the password token in the db
AuthModel.updateOne: updating a user passwordResetToken, passwordResetExpires props in the auth collection using the user id i.e authId


{ $gt: Date.now() }: checks if the expiration is greater than ($gt) the current date, which means it's still valid

*/

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async updatePasswordToken(
    authId: string,
    token: string,
    tokenExpiration: number
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration,
      }
    );
  }
  public async getUserByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query
    ).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Helpers.lowerCase(email),
    }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(
    token: string
  ): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
