import { hash, compare } from 'bcryptjs';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { model, Model, Schema } from 'mongoose';

/*
SCHEMA FOR USER DATA


SALT_ROUND: time needed to calculate a single BCrypt hash/the number of times we want the pass to be hashed
authSchema: defining datatypes for user data
transform: deleting the newly created passwrord in order to return it when a req is made to an auth doc

authSchema.pre('save') hook: this hash the password before saving to the db
this: a particular user doc that is being created
authSchema.methods.comparePassword: compares the pass the user supplies with the one in the db
authSchema.methods.hashPassword: used during password change

'Auth': name given to model to handle auth feature
*/
const SALT_ROUND = 10;

const authSchema: Schema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await hash(
    this.password as string,
    SALT_ROUND
  );
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (
  password: string
): Promise<string> {
  return hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>(
  'Auth',
  authSchema,
  'Auth'
);
export { AuthModel };
