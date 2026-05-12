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

export const getDefaultEventPath = (events: Event[]) => {
  const activeEvents = getActiveEvents(events)

  if (activeEvents.length === 1) {
    return `/events/${activeEvents[0].id}/guests`
  }

  return '/events'
}
