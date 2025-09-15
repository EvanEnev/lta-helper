import {LTWorker} from '@/src/utils/types'

export default async function authParseWorker(
  result: any,
  permissionsResult: any,
) {
  const permissions = permissionsResult.rows
  const workerResult = result.rows[0] || {}

  const worker: LTWorker = {
    name: workerResult.name,
    id: workerResult.id,
    balance: workerResult.balance,
    telegramId: workerResult.telegram_id,
    rank: workerResult.rank,
    firstName: workerResult.first_name,
    lastName: workerResult.last_name,
    middleName: workerResult.middle_name,
    phoneNumber: workerResult.phone_number,
    photoUrl: workerResult.photo_url,
    locationId: workerResult.location_id,
    location: workerResult.location,
    permissions,
    email: workerResult.email,
  }

  if (workerResult?.today_location) {
    worker.locationId = workerResult?.today_location
  }

  return worker
}
