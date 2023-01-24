import express, { Express, NextFunction, Request, ErrorRequestHandler } from 'express'
import { Response } from 'express-serve-static-core';
const dotenv = require('dotenv')
const app: Express = express()
import { InterfaceResponseData, InterfaceErrorMessage } from './types';
import mongoose from 'mongoose'
dotenv.config()
const Milk = require('./milk.schema')
const port = process.env.PORT || 8080

class ErrorMessage implements InterfaceErrorMessage {
  public statusCode: number;
  public message: string;
  constructor(status: number, message: string) {
    this.statusCode = status;
    this.message = message;
  }
}

declare module 'express-serve-static-core' {
  export interface Response {
    respondWithData?: InterfaceResponseData
  }
}

export interface CustomErrorRequestHandler extends ErrorRequestHandler {
  statusCode: number,
  message: string
}

const connectToMongoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGO_URI)
    if (mongoose.connection.readyState !== 1) {
      throw new ErrorMessage(500, 'Database is not available. Try again later')
    }
    return next();
  } catch (error) {
    return next(error)
  }
}

const paginateData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.limit && req.query.page) {
      const limit = +req.query.limit
      const page = +req.query.page
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const responseData: InterfaceResponseData = {
        result: await Milk.find().limit(limit).skip(startIndex)
      }
  
      if (startIndex > 0) {
        responseData.previous = page - 1
      }
  
      if (endIndex < await Milk.countDocuments()) {
        responseData.next = page + 1
      }
  
      res.respondWithData = responseData
      return next();
    }
    res.respondWithData = {result: await Milk.find()}
    return next();
  } catch (error) {
    return next(error)
  }
}

app.use(connectToMongoDB)
app.use(paginateData)

app.get('/', (req: Request, res: Response) => {
  return res.status(200).send({message: 'api resources can be found at /api/milk'});
})

app.route('/api/milk')
  .get(async (req: Request, res: Response) => {
    return res.status(200).json(res.respondWithData)
  })

app.route('/api/milk/:id')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try{
      const id = req.params.id;
      const result = await Milk.findOne({ id: id })
      if (!result) {
        throw new ErrorMessage(404, 'Milk not found');
      }
      return res.status(200).json(result)
    } catch (error) {
      return next(error)
    }
  })

app.get('*', (_req: Request, _res:Response, next:NextFunction) => {
  throw new ErrorMessage(400, 'This endpoint is not served');
});

app.use((error: CustomErrorRequestHandler, _req: Request, res:Response, _next:NextFunction) => {
  return res.status(error.statusCode).send({ message: error.message })
})

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`)
})
