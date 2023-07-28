import cloudinary, {
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

/*
TYPESCRIPT SYNTAX EXPLAINED
functionName: what would be returned/datatype of what would be returned

uploads(parameters to be sent to cloudinary: with type): this is our cloudinary file upload function
?: means optional
resolve: return promise value either error or desired result
cloudinary.v2.uploader.upload: cloudinarry library function to upload files. It takes args file, upload options, callback for result/error occured while uploading
*/
export function uploads(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) resolve(error);
        /* if error, else return result */
        resolve(result);
      }
    );
  });
}

/*
method to upload video file
chunk_size: uploads large file in chunks
*/
export function videoUpload(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        resource_type: 'video',
        chunk_size: 50000,
        public_id,
        overwrite,
        invalidate,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}
