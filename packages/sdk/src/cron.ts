import { handle } from './handle'

export type TCronPayload = {
  time: Date
}
export function handleCron(
  handler: (payload: TCronPayload) => void | Promise<void>
): void {
  handle(handler)
}
