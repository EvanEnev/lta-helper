import {JWT, GoogleAuth} from 'google-auth-library'
import {GoogleSpreadsheet} from 'google-spreadsheet'
import {google} from 'googleapis'

interface GoogleCredentials {
  type: string
  project_id: string | undefined
  private_key_id: string | undefined
  private_key: string
  client_email: string
  client_id: string | undefined
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string | undefined
  universe_domain: string
}

export interface GoogleDocument {
  schedule: GoogleSpreadsheet
  workers: GoogleSpreadsheet
  actors: GoogleSpreadsheet
  auth: GoogleAuth
}

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env variable: ${name}`)
  return value
}

let cached: GoogleDocument | undefined

function init(): GoogleDocument {
  const key = env('GOOGLE_KEY').replace(/\\n/g, '\n')

  const serviceAccountAuth = new JWT({
    email: env('GOOGLE_CLIENT_EMAIL'),
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const credentials: GoogleCredentials = {
    type: 'service_account',
    project_id: env('GOOGLE_PROJECT_ID'),
    private_key_id: env('GOOGLE_PRIVATE_KEY_ID'),
    private_key: key,
    client_email: env('GOOGLE_CLIENT_EMAIL'),
    client_id: env('GOOGLE_CLIENT_ID'),
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: env('GOOGLE_CLIENT_CERT_URL'),
    universe_domain: 'googleapis.com',
  }

  return {
    schedule: new GoogleSpreadsheet(
      env('SCHEDULE_SHEET_ID'),
      serviceAccountAuth,
    ),
    workers: new GoogleSpreadsheet(env('WORKERS_SHEET_ID'), serviceAccountAuth),
    actors: new GoogleSpreadsheet(env('ACTORS_SHEET_ID'), serviceAccountAuth),
    auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    }),
  }
}

const get = () => (cached ??= init())

const googleApi: GoogleDocument = {
  get schedule() {
    return get().schedule
  },
  get workers() {
    return get().workers
  },
  get actors() {
    return get().actors
  },
  get auth() {
    return get().auth
  },
}

export default googleApi
