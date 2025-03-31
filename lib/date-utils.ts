import { format } from "date-fns"

export function formatDateRange(dateFrom: Date | string, dateUntil: Date | string) {
  const from = new Date(dateFrom)
  const until = new Date(dateUntil)
  const isSameMonth = from.getMonth() === until.getMonth() && from.getFullYear() === until.getFullYear()
  
  return isSameMonth
    ? `${format(from, "d")}–${format(until, "d MMM yyyy")}`
    : `${format(from, "d MMM")}–${format(until, "d MMM yyyy")}`
} 