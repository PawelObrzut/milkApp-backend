import express, { Express, Request, Response } from 'express'
import { type } from 'os';
const dotenv = require('dotenv')
const app: Express = express()
import milkData from './milk.json'
import { InterfaceMilk } from './types';

dotenv.config()

const port = process.env.PORT || 8080

app.get('/', (req: Request, res: Response) => {
  res.json(milkData);
})

app.route('/api/milk')
  .get((req: Request, res: Response) => {
    if(req.query.limit && req.query.page) {
      const num = +req.query.limit
      const pag = +req.query.page
    }
    const result = milkData.results.slice(0,7)

    res.send(result)
  })

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`)
})
