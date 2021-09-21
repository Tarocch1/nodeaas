import { THttpFunctionConfig } from '@type/http.type'

export type TConfig = {
  http: {
    port: number
    host: string
    prefix: string
  }
  httpFunctions: THttpFunctionConfig[]
}
