const realFetch = globalThis.fetch

const konsol = (path: string) => {
  if (path.startsWith('/bus/alpha/workflow/locations/')) {
    return {address: {id: 1}}
  }
  if (path.startsWith('/v2/contractors')) return [{id: 1}]
  if (path.startsWith('/bus/alpha/workflow/platform/tasks')) {
    return {task_id: Math.floor(Math.random() * 1_000_000)}
  }

  return path.startsWith('/v2/acts') ? [] : {}
}

globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === 'string' || input instanceof URL ? input : input.url,
  )

  if (url.hostname === 'api.telegram.org') {
    return Response.json({ok: true, result: {}})
  }

  if (url.hostname === 'api.konsol.ru') {
    return Response.json(konsol(url.pathname + url.search))
  }

  return realFetch(input, init)
}
export {}
