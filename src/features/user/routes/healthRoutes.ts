import express, { Router, Request, Response } from 'express';
import moment from 'moment';
import axios from 'axios';
import { performance } from 'perf_hooks';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';

class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  /* 
  health(): method to determine the status of our responses in our app
  /health: route to make request to, to know the status of the server 
  .send: sends resp if healthy
  {process.pid}: processID ..instance of the  process..gotten from Node
  moment(): the date when the response was sent
  */
  public health(): Router {
    this.router.get('/health', (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Health: Server instance is healthy with process id ${
            process.pid
          } on ${moment().format('LL')}`
        );
    });

    return this.router;
  }

  /* 
  this route is used to display the exact environment we're on
  */
  public env(): Router {
    this.router.get('/env', (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.OK)
        .send(
          `This is the ${config.NODE_ENV} environment.rfrgrg5t3e2e3e3r4g5g`
        );
    });

    return this.router;
  }

  /*
   used to get the exact instance we're are running. Say on AWS EC2
   response: makes a call to the EC2 endpoint using axios
   {process.pid}: processID ..instance of the  process..gotten from Node
   moment(): the date when the response was sent
   */
  public instance(): Router {
    this.router.get('/instance', async (req: Request, res: Response) => {
      const response = await axios({
        method: 'get',
        url: config.EC2_URL,
      });
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Server is running on EC2 instance with id ${
            response.data
          } and process id ${process.pid} on ${moment().format('LL')}`
        );
    });

    return this.router;
  }


  /* 
    this route is used to test the health of our app, by placing a lot of load on the CPU using the fibo().
    So we'll be able to see when the process started and how long it took
    end - start: end minus start, gives us the time it took to get a response
    
  */
  public fiboRoutes(): Router {
    this.router.get('/fibo/:num', async (req: Request, res: Response) => {
      const { num } = req.params;
      const start: number = performance.now();
      const result: number = this.fibo(parseInt(num, 10));
      const end: number = performance.now();
      const response = await axios({
        method: 'get',
        url: config.EC2_URL,
      });
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Fibonacci series of ${num} is ${result} and it took ${
            end - start
          }ms and runs with process id ${process.pid} on ${
            response.data
          } at ${moment().format('LL')}`
        );
    });

    return this.router;
  }

  /* 
  this method is used to create heavy load on our cpu JUST FOR TESTING our health routes
  fibo: is a sequence in which a number is the sum of two preceeding numbers
  */
  private fibo(data: number): number {
    if (data < 2) {
      return 1;
    } else {
      return this.fibo(data - 2) + this.fibo(data - 1);
    }
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
