export type TCronFunctionConfig = {
  cron: string
  name: string
  module: string
  timeout?: number
}

export type TCronPayload = {
  time: Date
}
