# The MilkApp Server

a backend part of a fullStack project

***

## Intro

An express server in Node.js wrapped in typescript to handle requests with resources from mongoDB database.
It serves the inventory api for a milk store.

## Technologies

- Node / Express
    - with *concurrently* and *nodemon* in devDepencencies
- REST api architecture
- Typescript
- Mongoose / Schema

## Launch

1. Clone this repositoy and run following commands in cli

2. > npm install

3. You will also need an instance of mongoDB database like MongoDB Atlas and your own secret password. 

    > create **.env** file and set your url in  **MONGO_URI** variable - e.g: *"mongodb://**Name:Pass**@cluster0.sk.mongodb.net/**Collection**?retry=true&w=majority"*

4. Populate your database with documents of the following structure:

        {
          name: string,
          type: string,
          storage: number,
          id: string
        }

    > you may use milk.json

5. Finally initiate localhost on port 8080 with

    > npm run dev
