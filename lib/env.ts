// Centralized environment validation
const REQUIRED_ENVS = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_SECRET']

const missing = REQUIRED_ENVS.filter((k) => !process.env[k])
if (missing.length) {
  const msg = `Missing required env vars: ${missing.join(', ')}`
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg)
  } else {
    // Warn in non-production to avoid breaking local/dev runs
    // but inform the operator clearly.
    // eslint-disable-next-line no-console
    console.warn(`⚠️  ${msg} — running in non-production; set these before deploying.`)
  }
}

export const MONGODB_URI = process.env.MONGODB_URI || ''
export const JWT_SECRET = process.env.JWT_SECRET || ''
export const ADMIN_SECRET = process.env.ADMIN_SECRET || ''
export const NODE_ENV = process.env.NODE_ENV || 'development'

export default {
  MONGODB_URI,
  JWT_SECRET,
  ADMIN_SECRET,
  NODE_ENV,
}
