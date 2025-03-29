export function daysToWeeks(days) {
  const weeks = [[]]

  let emptyFill = 0
  for (let i = 0; i < days.length; i++) {
    if (i === 0) {
      let day = days[0].getDay() - 1
      if (day < 0) day = 7 - Math.abs(day)

      emptyFill = day
      for (let x = 0; x < emptyFill; x++) {
        weeks[0].push(null)
      }
    }

    if (!Array.isArray(weeks[Math.floor((i + emptyFill) / 7)])) {
      weeks[Math.floor((i + emptyFill) / 7)] = []
    }
    weeks[Math.floor((i + emptyFill) / 7)].push(days[i])
  }
  return weeks
}
