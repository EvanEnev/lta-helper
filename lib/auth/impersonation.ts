export const IMPERSONATOR_ID = 9
export const IMPERSONATE_COOKIE = 'impersonate'

export const parseImpersonateId = (value?: string | null): number | null =>
  value && /^[1-9]\d{0,8}$/.test(value) ? Number(value) : null
