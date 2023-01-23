import express, { Express, NextFunction, Request } from 'express'
import { Response } from "express-serve-static-core";
const dotenv = require('dotenv')
const app: Express = express()
import milkData from './milk.json'
import { InterfaceResponseData } from './types';
dotenv.config()

import mongoose from 'mongoose'
const Milk = require('./milk.schema')
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URI)

// !! To be removed
// ** populating mongoDB database with simple loop on json mock data.
// const db = mongoose.connection
// db.once('open', async () => {
//   milkData.results.forEach( async result => {
//    await Milk.create({
//       name: result.name,
//       type: result.type,
//       storage: result.storage,
//       id: result.id
//     })
//   })
//   console.log('done')
// })

const port = process.env.PORT || 8080

declare module "express-serve-static-core" {
  export interface Response {
    respondWithData?: InterfaceResponseData
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
      next();
    }
    res.respondWithData = {result: await Milk.find()}
    next();
  } catch (err) {
    // next write custom error middleware
  }
}

app.use(paginateData)

app.get('/', (req: Request, res: Response) => {
  res.json(milkData);
})

app.route('/api/milk')
  .get(async (req: Request, res: Response) => {
    res.json(res.respondWithData)
  })

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`)
})
