import {readFileSync} from 'node:fs'
import path from 'node:path'
import type {PGlite} from '@electric-sql/pglite'
import {DateTime, Interval} from 'luxon'
import type {Pool} from 'pg'

const parsers = {
  20: (val: string) => val,
  1700: (val: string) => val,
  1082: (val: string) => DateTime.fromISO(val, {zone: 'Europe/Moscow'}),
  1114: (val: string) => DateTime.fromSQL(val, {zone: 'Europe/Moscow'}),
  3912: (val: string) => {
    if (val === 'empty') return null

    const range = Interval.fromISO(val.slice(1, -1).replace(',', '/'))

    return range.set({end: range.end?.minus({days: 1})})
  },
}

const sql = (file: string) =>
  readFileSync(path.join(process.cwd(), 'lib/demo', file), 'utf8')

const globalDemo = globalThis as unknown as {demoPglite?: Promise<PGlite>}

export function getPglite() {
  globalDemo.demoPglite ??= (async () => {
    const [{PGlite}, {pg_trgm}, {unaccent}] = await Promise.all([
      import('@electric-sql/pglite'),
      import('@electric-sql/pglite/contrib/pg_trgm'),
      import('@electric-sql/pglite/contrib/unaccent'),
    ])
    const pg = new PGlite({extensions: {pg_trgm, unaccent}, parsers})

    await pg.waitReady
    await pg.exec(
      "set timezone = 'Europe/Moscow'; set search_path = public, functions",
    )
    await pg.exec(sql('schema.sql'))
    await pg.exec(sql('seed.sql'))

    return pg
  })()

  return globalDemo.demoPglite
}

const toParam = (value: unknown) =>
  DateTime.isDateTime(value) ? value.toISO() : value

// shortcut: транзакции не изолированы друг от друга (одно соединение), для демо с одним пользователем достаточно
async function query(
  text: string | {text: string; values?: unknown[]},
  values?: unknown[],
) {
  const pg = await getPglite()
  const config = typeof text === 'string' ? {text, values} : text
  const params = config.values?.map(toParam)

  if (!params?.length && /;\s*\S/.test(config.text)) {
    const results = await pg.exec(config.text)
    const last = results[results.length - 1]

    return {rows: last?.rows ?? [], rowCount: last?.rows.length ?? 0}
  }

  const res = await pg.query(config.text, params)

  return {rows: res.rows, rowCount: res.affectedRows || res.rows.length}
}

const client = {query, release: () => {}}

export const demoDb = {
  query,
  connect: async () => client,
  end: async () => {},
} as unknown as Pool
