declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string
      NODE_ENV: 'development' | 'production'
    }
  }
}

declare module 'express-serve-static-core' {
  export interface Response {
    respondWithData?: InterfaceResponseData
  }
}

export {};
