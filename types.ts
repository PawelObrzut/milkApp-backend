import { StringExpressionOperator } from "mongoose"

export interface InterfaceMilk {
  name: string,
  type: string,
  storage: number,
  id: string,
}

export interface InterfaceResponseData {
  next?: number,
  previous?: number,
  result: InterfaceMilk[],
}

export interface InterfaceErrorMessage {
  statusCode: number,
  message: string,
}

// export interface InterfaceErrorMessageWithConstructor {
//   new (statusCode: number, message: string): { statusCode: number, message: string},
// }