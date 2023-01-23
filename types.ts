export interface InterfaceMilk {
  name: string,
  type: string,
  storage: number
  id: string
}

export interface InterfaceResponseData {
  next?: number,
  previous?: number,
  result: InterfaceMilk[]
}