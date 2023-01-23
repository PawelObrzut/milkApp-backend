import express, { Express, NextFunction, Request } from 'express'
import { Response } from "express-serve-static-core";
const dotenv = require('dotenv')
const app: Express = express()
import milkData from './milk.json'
import { InterfaceResponseData } from './types';

dotenv.config()
const port = process.env.PORT || 8080

declare module "express-serve-static-core" {
  export interface Response {
    respondWithData?: InterfaceResponseData
  }
}

const paginateData = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.limit && req.query.page) {
    const limit = +req.query.limit
    const page = +req.query.page
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const responseData: InterfaceResponseData = {
      result: milkData.results.slice(startIndex, endIndex)
    }
    if (startIndex > 0) {
      responseData.previous = page - 1
    }
    if (endIndex < milkData.results.length) {
      responseData.next = page + 1
    }
    res.respondWithData = responseData
    next();
  }
  next();
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
