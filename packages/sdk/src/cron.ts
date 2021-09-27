export type TCronPayload = {
  time: Date
}
export function handleCron(
  handler: (payload: TCronPayload) => void | Promise<void>
): void {
  process.on('message', (payload) => {
    const result = handler(payload as TCronPayload)
    const p = result instanceof Promise ? result : Promise.resolve(result)
    p.then(() => {
      process.disconnect()
    })
  })
}
