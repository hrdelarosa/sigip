import { format } from 'date-fns'
import { useEffect, useState } from 'react'

function calendarToday() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function useCalendarToday() {
  const [today, setToday] = useState(calendarToday)

  useEffect(() => {
    const now = new Date()
    const nextDay = new Date(now)
    nextDay.setHours(24, 0, 0, 0)

    const timeout = window.setTimeout(
      () => setToday(calendarToday()),
      nextDay.getTime() - now.getTime(),
    )

    return () => window.clearTimeout(timeout)
  }, [today])

  return today
}
