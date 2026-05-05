import {execFile} from 'child_process'
import {writeFile, unlink} from 'fs/promises'
import {tmpdir} from 'os'
import path from 'path'

const READER_PATH = path.join(process.cwd(), 'reader', 'out')
const MAX_SIZE = 100 * 1024 * 1024 // 100mb

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) {
    return Response.json({error: 'No file provided'}, {status: 400})
  }

  if (file.size > MAX_SIZE) {
    return Response.json({error: 'File too large'}, {status: 413})
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const tmpPath = path.join(
    tmpdir(),
    `litedb_${Date.now()}_${Math.random().toString(36).slice(2)}.db`,
  )

  try {
    await writeFile(tmpPath, buffer)

    const data = await new Promise<object>((resolve, reject) => {
      execFile(
        READER_PATH,
        [tmpPath],
        {maxBuffer: 200 * 1024 * 1024},
        (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message))
          try {
            resolve(JSON.parse(stdout))
          } catch {
            reject(new Error('Failed to parse reader output'))
          }
        },
      )
    })

    return Response.json(data)
  } catch (err: any) {
    return Response.json({error: err.message}, {status: 500})
  } finally {
    await unlink(tmpPath).catch(() => {})
  }
}
