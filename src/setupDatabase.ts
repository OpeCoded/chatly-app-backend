import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import { redisConnection } from '@service/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  /*
default (): ANONYMOUS or NAMELESS FUNCTION. it can be imported by using anyname you desire
connect: used to connect to mongoose
mongodb://localhost:27017: mongodb url and port
chattyapp-backend: our db name
connect(): invoking the connection
process.exit(1): this exits the current process that is running
mongoose.connection.on: listening to the connection, if it's disconnected then connect back again
*/

  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Connection to database successful!');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();
  mongoose.connection.on('disconnected', connect);
};
