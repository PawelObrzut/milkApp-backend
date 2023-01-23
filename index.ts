import express, { Express, Request, Response } from 'express'
const dotenv = require('dotenv')
const app: Express = express()
import milkData from './milk.json'
import { InterfaceMilk, InterfaceResponseData } from './types';

dotenv.config()

const port = process.env.PORT || 8080

app.get('/', (req: Request, res: Response) => {
  res.json(milkData);
})

app.route('/api/milk')
  .get((req: Request, res: Response) => {
    if(req.query.limit && req.query.page) {
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
      return res.status(200).send(responseData)
    }
    return res.status(200).send(milkData.results)
  })

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`)
})
