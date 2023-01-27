import express, {
  Express, NextFunction, Request, ErrorRequestHandler,
} from 'express';
import { Response } from 'express-serve-static-core';
import mongoose from 'mongoose';
import { InterfaceResponseData, InterfaceErrorMessage, InterfaceMilk } from './types';

const dotenv = require('dotenv');

const app: Express = express();
const cors = require('cors');

dotenv.config();
const Milk = require('./milk.schema');

const port = process.env.PORT || 8080;

class ErrorMessage implements InterfaceErrorMessage {
  public statusCode: number;

  public message: string;

  constructor(status: number, message: string) {
    this.statusCode = status;
    this.message = message;
  }
}

interface CustomErrorRequestHandler extends ErrorRequestHandler {
  statusCode: number,
  message: string,
}

const connectToMongoDB = async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);

    if (mongoose.connection.readyState !== 1) {
      return new ErrorMessage(500, 'Database is not available. Try again later');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const formatResponseData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const startIndex = (+page - 1) * +limit;
    const endIndex = +page * +limit;
    const filter = req.query.filter as string | undefined;
    let result: InterfaceMilk[] = [];
    let count = 0;

    if (filter) {
      result = await Milk.find({ type: { $in: filter.split('+') } }).limit(limit).skip(startIndex).exec();
      count = await Milk.find({ type: { $in: filter.split('+') } }).countDocuments().exec();
    } else {
      result = await Milk.find().limit(+limit).skip(startIndex).exec();
      count = await Milk.find().countDocuments().exec();
    }

    const responseData: InterfaceResponseData = {
      limit: +limit,
      page: +page,
      count,
      result,
    };

    if (startIndex > 0) {
      responseData.previous = +page - 1;
    }
    if (endIndex < count) {
      responseData.next = +page + 1;
    }

    res.respondWithData = responseData;
    next();
  } catch (error) {
    next(error);
  }
};

app.use(cors());
app.use(connectToMongoDB);
app.use(formatResponseData);

app.get('/', (_req: Request, res: Response) => res.status(200).send({ message: 'api resources can be found at /api/milk' }));

app.route('/api/milk')
  .get((_req: Request, res: Response) => res.status(200).json(res.respondWithData));

app.route('/api/milk/:name')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      const result = await Milk.find({ name: new RegExp(name, 'i') });
      if (!result) {
        return new ErrorMessage(404, 'Milk not found');
      }
      const respond:InterfaceResponseData = {
        result,
        count: result.length,
      };
      return res.status(200).json(respond);
    } catch (error) {
      return next(error);
    }
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('*', (_req: Request, _res:Response, _next:NextFunction) => new ErrorMessage(400, 'This endpoint is not served'));

// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len
app.use((error: CustomErrorRequestHandler, _req: Request, res:Response, _next:NextFunction) => res.status(error.statusCode).send({ message: error.message }));

app.listen(port);
