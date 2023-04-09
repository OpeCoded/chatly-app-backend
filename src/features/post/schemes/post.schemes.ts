import Joi, { ObjectSchema } from 'joi';
/*
Here, we are defining what the request body is expected to be like for post upload
postSchema: post without image
postWithImageSchema: post with image
allow(null, ''): joi should not throw any error if the req props are sent with null or '' from the client


*/
const postSchema: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, '')
});

const postWithImageSchema: ObjectSchema = Joi.object().keys({
  image: Joi.string().required().messages({
    'any.required': 'Image is a required field',
    'string.empty': 'Image property is not allowed to be empty'
  }),
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, '')
});

export { postSchema, postWithImageSchema };
