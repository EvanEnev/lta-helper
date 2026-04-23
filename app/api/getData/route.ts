import {NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import getWorkingDays from '@/lib/functions/getWorkingDays'

export async function GET() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) {
    return NextResponse.json({message: 'Пользователь не найден'}, {status: 500})
  }

  const id = worker.id

  const workingDays = await getWorkingDays({id})

  return NextResponse.json({workingDays, worker})
}
