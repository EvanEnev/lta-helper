import {NextRequest} from 'next/server'
import changeWorkerRank from '@/lib/functions/changeWorkerRank'

export async function POST(req: NextRequest) {
  return changeWorkerRank(req, -1)
}
