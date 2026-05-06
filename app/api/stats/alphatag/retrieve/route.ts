import {execFile} from 'child_process'
import {writeFile, unlink} from 'fs/promises'
import {tmpdir} from 'os'
import path from 'path'
import Database from 'better-sqlite3'

const READER_PATH = path.join(process.cwd(), 'reader', 'out', 'reader')

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) return Response.json({error: 'No file'}, {status: 400})

  const buffer = Buffer.from(await file.arrayBuffer())
  const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
  const liteDbPath = path.join(tmpdir(), `${id}.db`)
  const sqlitePath = path.join(tmpdir(), `${id}.sqlite`)

  try {
    await writeFile(liteDbPath, buffer)

    await new Promise<void>((resolve, reject) => {
      execFile(READER_PATH, [liteDbPath, sqlitePath], (err, _, stderr) => {
        if (err) return reject(new Error(stderr || err.message))
        resolve()
      })
    })

    const db = new Database(sqlitePath, {readonly: true})

    const result: Record<string, any[]> = {}
    for (const name of ['GameStatisticData', 'GameSessionStatisticData']) {
      try {
        result[name] = db.prepare(`SELECT * FROM "${name}"`).all()
      } catch {
        result[name] = []
      }
    }

    db.close()
    console.debug(result)
    return Response.json(result)
  } catch (err: any) {
    return Response.json({error: err.message}, {status: 500})
  } finally {
    await Promise.all([
      unlink(liteDbPath).catch(() => {}),
      // unlink(sqlitePath).catch(() => {}),
    ])
  }
}
