import dotenv from 'dotenv';
import bunyan from 'bunyan';

/*
dotenv.config: used to load environment vars from .env file
const config: an instance of the Config class, which will be used to reference any env var we want to use e.g config.DATABASE_URL
public DATABASE_URL: calling all environment vars from the .env file
constructor(): instantiates the value of the env vars to the values we loaded from .env file || (i.e  OR use default value if not found)
DEFAULT_DATABASE_URL: a default db url, incase the value isn't loaded from the .env file. The default url will be used
validateConfig(): this verifies that the env vars actually exists using a loop to loop through all the env vars (keys) and the values in the constructor object using 'this'.
createLogger: our custom logger. prop name: is an identifier for a log e.g login_failed
 */
dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST: string | undefined;

  private readonly DEFAULT_DATABASE_URL =
    'mongodb://127.0.0.1:27017/chattyapp-backend';

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }
}

export const config: Config = new Config();
