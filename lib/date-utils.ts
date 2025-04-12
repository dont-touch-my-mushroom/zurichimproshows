import { format, parseISO, isValid } from 'date-fns'

export function formatDateRange(dateFromInput: Date | string | null, dateUntilInput: Date | string | null): string {
  if (!dateFromInput || !dateUntilInput) {
    return ""
  }

  let from: Date
  if (typeof dateFromInput === 'string') {
    from = parseISO(dateFromInput)
  } else {
    from = dateFromInput
  }

  let until: Date
  if (typeof dateUntilInput === 'string') {
    until = parseISO(dateUntilInput)
  } else {
    until = dateUntilInput
  }

  if (!isValid(from) || !isValid(until)) {
    console.error("Invalid date passed to formatDateRange:", { dateFromInput, dateUntilInput })
    return "Invalid date range"
  }

  const isSameMonth = from.getMonth() === until.getMonth() && from.getFullYear() === until.getFullYear()
  
  return isSameMonth
    ? `${format(from, "d")}–${format(until, "d MMM yyyy")}`
    : `${format(from, "d MMM")}–${format(until, "d MMM yyyy")}`
} 