import { Service } from '@src/services/Service'

export function initServices(): void {
  global.services = {} as Record<string, Service>
}
