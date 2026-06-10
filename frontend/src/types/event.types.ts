export interface CalEvent {
  id: string
  title: string
  date: string
  type: string
  description?: string
  source?: 'google' | 'local'
}

export type IntegrationProvider = 'google' | 'outlook'

export interface IntegrationStatus {
  google: boolean
  outlook: boolean
}
