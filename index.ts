import express, { Express, NextFunction, Request, ErrorRequestHandler } from 'express'
import { Response } from 'express-serve-static-core'
const dotenv = require('dotenv')
const app: Express = express()
const cors = require('cors')
import { InterfaceResponseData, InterfaceErrorMessage } from './types'
import mongoose from 'mongoose'
dotenv.config()
const Milk = require('./milk.schema')
const port = process.env.PORT || 8080

class ErrorMessage implements InterfaceErrorMessage {
  public statusCode: number
  public message: string
  constructor(status: number, message: string) {
    this.statusCode = status
    this.message = message
  }
}

interface CustomErrorRequestHandler extends ErrorRequestHandler {
  statusCode: number,
  message: string,
}

const connectToMongoDB = async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGO_URI)
    if (mongoose.connection.readyState !== 1) {
      throw new ErrorMessage(500, 'Database is not available. Try again later')
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

interface InterfaceValidatingQuery {
  page?: string
  limit?: string
  filter?: string
}

const validatingQuery = (query: InterfaceValidatingQuery) => {
  // refactor paginateData => to be continued...
}

const paginateData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.limit && req.query.page && req.query.filter) {
      const request = req.query.filter as string
      const filter = request.split('+')
      const limit = +req.query.limit
      const page = +req.query.page
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const count = await Milk.find({ type: {$in: filter} }).countDocuments().exec()

      const responseData: InterfaceResponseData = {
        limit,
        page,
        count,
        result: await Milk.find({ type: {$in: filter} }).limit(limit).skip(startIndex).exec()
      }
      if (startIndex > 0) {
        responseData.previous = page - 1
      }
      if (endIndex < count) {
        responseData.next = page + 1
      }
  
      res.respondWithData = responseData
      return next()
    }
    if (req.query.limit && req.query.page) {
      const limit = +req.query.limit
      const page = +req.query.page
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const count = await Milk.countDocuments().exec()
  
      const responseData: InterfaceResponseData = {
        limit,
        page,
        count,
        result: await Milk.find().limit(limit).skip(startIndex).exec()
      }
      if (startIndex > 0) {
        responseData.previous = page - 1
      }
      if (endIndex < count) {
        responseData.next = page + 1
      }
  
      res.respondWithData = responseData
      return next()
    }
    res.respondWithData = {count: await Milk.countDocuments().exec(), result: await Milk.find().exec()}
    return next()
  } catch (error) {
    return next(error)
  }
}

app.use(cors())
app.use(connectToMongoDB)
app.use(paginateData)

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).send({message: 'api resources can be found at /api/milk'})
})

app.route('/api/milk')
  .get((_req: Request, res: Response) => {
    return res.status(200).json(res.respondWithData)
  })

app.route('/api/milk/:name')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try{
      const name = req.params.name
      const result = await Milk.find({ name: new RegExp(name, 'i') })
      if (!result) {
        throw new ErrorMessage(404, 'Milk not found')
      }
      const respond:InterfaceResponseData = {
        result: result,
        count: result.length,
      }
      return res.status(200).json(respond)
    } catch (error) {
      return next(error)
    }
  })

app.get('*', (_req: Request, _res:Response, next:NextFunction) => {
  throw new ErrorMessage(400, 'This endpoint is not served')
});

app.use((error: CustomErrorRequestHandler, _req: Request, res:Response, _next:NextFunction) => {
  return res.status(error.statusCode).send({ message: error.message })
})

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`)
})
