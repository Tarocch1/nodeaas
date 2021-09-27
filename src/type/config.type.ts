import { THttpConfig, THttpFunctionConfig } from '@type/http.type'
import { TCronFunctionConfig } from '@type/cron.type'

export type TConfig = {
  http: THttpConfig
  httpFunctions: THttpFunctionConfig[]
  cronFunctions: TCronFunctionConfig[]
}
