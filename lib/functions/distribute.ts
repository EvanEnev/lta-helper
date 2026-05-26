// lib/distribute.ts
import solver from 'javascript-lp-solver'

export interface Location {
  location_id: number
  value: number
  priority: number
  lat: number
  lng: number
}

export interface Employee {
  employee_id: number
  rank_id: number
  salary: number
  lat: number
  lng: number
  upcoming_shifts: {location_id: number; date: string}[]
}

export interface Assignment {
  employee_id: number
  location_id: number
  score: number
  distance_km: number
  remaining_value: number
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dlat = ((lat2 - lat1) * Math.PI) / 180
  const dlng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dlng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

function daysUntilShift(
  employee: Employee,
  locationId: number,
  targetDate: string,
) {
  const target = new Date(targetDate).getTime()
  const future = employee.upcoming_shifts
    .filter(s => s.location_id === locationId)
    .map(s => Math.round((new Date(s.date).getTime() - target) / 86400000))
    .filter(d => d >= 0)
  return future.length ? Math.min(...future) : null
}

function computeScore(
  employee: Employee,
  location: Location,
  targetDate: string,
) {
  if (location.location_id === 2 && employee.rank_id === 13) {
    return 100000
  }

  if (location.location_id === 15 && employee.salary < 0) {
    return 100000
  }

  let score = 0

  score += location.priority * 1000

  const days = daysUntilShift(employee, location.location_id, targetDate)
  if (days === 0) score += 500
  else if (days === 1) score += 400
  else if (days !== null && days <= 7) score += Math.max(0, 300 - days * 40)

  const dist = haversine(employee.lat, employee.lng, location.lat, location.lng)
  score += Math.max(0, 200 - Math.round(dist * 10))

  return score
}

export function distribute(
  employees: Employee[],
  locations: Location[],
  targetDate: string,
): Assignment[] {
  const scores = employees.map(e =>
    locations.map(l => computeScore(e, l, targetDate)),
  )

  const varName = (ei: number, li: number) => `x_${ei}_${li}`

  const model: any = {
    optimize: 'score',
    opType: 'max',
    constraints: {},
    variables: {},
    ints: {},
  }

  // Переменные
  employees.forEach((emp, ei) => {
    locations.forEach((_, li) => {
      const name = varName(ei, li)
      model.variables[name] = {
        score: scores[ei][li],
        [`one_loc_${ei}`]: 1,
        [`remaining_${li}`]: emp.salary,
      }
      model.ints[name] = 1
    })
  })

  // Каждый сотрудник ровно на одной локации
  employees.forEach((_, ei) => {
    model.constraints[`one_loc_${ei}`] = {equal: 1}
  })

  // Остаток на локации > 0
  locations.forEach((l, li) => {
    if (l.location_id === 15) return

    model.constraints[`remaining_${li}`] = {max: l.value - 1}
  })

  const result: any = solver.Solve(model)

  if (!result.feasible) return []

  // Считаем остатки
  const remainingMap = new Map(locations.map(l => [l.location_id, l.value]))
  employees.forEach((emp, ei) => {
    locations.forEach((loc, li) => {
      if (Math.round(result[varName(ei, li)] ?? 0) === 1) {
        remainingMap.set(
          loc.location_id,
          remainingMap.get(loc.location_id)! - emp.salary,
        )
      }
    })
  })

  // Собираем результат
  const assignments: Assignment[] = []
  employees.forEach((emp, ei) => {
    locations.forEach((loc, li) => {
      if (Math.round(result[varName(ei, li)] ?? 0) === 1) {
        assignments.push({
          employee_id: emp.employee_id,
          location_id: loc.location_id,
          score: scores[ei][li],
          distance_km:
            Math.round(haversine(emp.lat, emp.lng, loc.lat, loc.lng) * 10) / 10,
          remaining_value: remainingMap.get(loc.location_id)!,
        })
      }
    })
  })

  return assignments
}
