import { Event } from '../services/api'

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getTodayDateKey = () => formatLocalDateKey(new Date())

export const isEventActiveOnDate = (event: Event, dateKey = getTodayDateKey()) =>
  event.f_start_date <= dateKey && dateKey <= event.f_end_date

export const getActiveEvents = (events: Event[], dateKey = getTodayDateKey()) =>
  events.filter((event) => isEventActiveOnDate(event, dateKey))

const getEventHomePath = (event: Event, dateKey: string) =>
  // durante o evento a home é a grade de monitoramento; antes/depois, a preparação (guests)
  isEventActiveOnDate(event, dateKey)
    ? `/events/${event.id}/room-grid`
    : `/events/${event.id}/guests`

export const getDefaultEventPath = (events: Event[]) => {
  const dateKey = getTodayDateKey()

  // prioridade 1: evento marcado manualmente como entrada padrão
  const entryDefault = events.find((event) => event.f_is_entry_default)
  if (entryDefault) {
    return getEventHomePath(entryDefault, dateKey)
  }

  // prioridade 2: exatamente um evento em curso hoje
  const activeEvents = getActiveEvents(events, dateKey)
  if (activeEvents.length === 1) {
    return getEventHomePath(activeEvents[0], dateKey)
  }

  return '/events'
}
