/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoiRequestValidationError } from '@global/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

/*
My own understanding:

IJoiDecorator: represents the type of data/values that would be returned
joiValidation: this is our method for validating user enteries,
which takes in an arg of var schema type objectschema (e.g the ones we defined in auth/schemes dir),
then we attach the IJoiDecorator type we declared to it.

originalMethod: value returned by joiValidation
...args: we passing all properties/args from the method where the joiValidation() will be called i.e  func signUp(req, res, next)
{ error }: destructuring error from the joi validate method
descriptor: PropertyDescriptor: this is an interface, which decribes the type of value that would be returned
_target: any, _key: string: Properties starting with _underscore means they're not being used, but are required to be defined.

 async function (...args: any[]): this is where the actual validation is taking palce
 req: getting the first prop/element/arg (request) in the function in which validation is to be perforomed on i.e  func signUp(req, res, next)
 schema.validate(): joi method used to validate the req body

 error?.details: if error exist
 details: is from joivalidation module
 details[0]: error value at first index (string.base) in signupSchema {} in schemes/signup.ts
 originalMethod.apply(this, args): if no error exist, this resets the args to it's original value
*/

type IJoiDecorator = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
