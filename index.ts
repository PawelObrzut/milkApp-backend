import express, {
  Express, Request, Response, NextFunction,
} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import MilkModel from './milk.schema';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

class ErrorMessage extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const connectToMongoDB = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI || '');

    if (mongoose.connection.readyState !== 1) {
      next(new ErrorMessage(500, 'Database is not available. Try again later'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

const formatResponseData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const filter = req.query.filter as string | undefined;

    let query = {};
    if (filter) {
      query = { type: { $in: filter.split('+') } };
    }

    const result = await MilkModel.find(query).limit(limit).skip(startIndex).exec();
    const count = await MilkModel.countDocuments(query).exec();

    const responseData: any = {
      limit,
      page,
      count,
      result,
    };

    if (startIndex > 0) responseData.previous = page - 1;
    if (endIndex < count) responseData.next = page + 1;

    res.locals.respondWithData = responseData;
    next();
  } catch (error) {
    next(error);
  }
};

app.use(cors());
app.use(connectToMongoDB);
app.use(formatResponseData);
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'API resources can be found at /api/milks' });
});

app.get('/api/milks', (_req: Request, res: Response) => {
  res.status(200).json(res.locals.respondWithData);
});

app.get('/api/milks/:name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const result = await MilkModel.find({ name: new RegExp(name, 'i') }).exec();

    if (!result || result.length === 0) {
      throw new ErrorMessage(404, 'Milk not found');
    }

    res.status(200).json({
      count: result.length,
      result,
    });
  } catch (error) {
    next(error);
  }
});

app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorMessage(404, 'This endpoint is not served'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
