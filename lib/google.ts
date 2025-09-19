import {JWT, GoogleAuth} from 'google-auth-library'
import {GoogleSpreadsheet} from 'google-spreadsheet'
import {google} from 'googleapis'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SCHEDULE_SHEET_ID: string
      WORKERS_SHEET_ID: string
      ACTORS_SHEET_ID: string
      GOOGLE_CLIENT_EMAIL: string
      GOOGLE_PRIVATE_KEY: string
      GOOGLE_KEY: string
      GOOGLE_PROJECT_ID?: string
      GOOGLE_PRIVATE_KEY_ID?: string
      GOOGLE_CLIENT_ID?: string
      GOOGLE_CLIENT_CERT_URL?: string
    }
  }
}

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

const formattedPrivateKey = process.env.GOOGLE_KEY.replace(/\\n/g, '\n')

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: formattedPrivateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const credentials: GoogleCredentials = {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: formattedPrivateKey,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com',
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const schedule = new GoogleSpreadsheet(
  process.env.SCHEDULE_SHEET_ID,
  serviceAccountAuth,
)

const workers = new GoogleSpreadsheet(
  process.env.WORKERS_SHEET_ID,
  serviceAccountAuth,
)

const actors = new GoogleSpreadsheet(
  process.env.ACTORS_SHEET_ID,
  serviceAccountAuth,
)

const googleApi: GoogleDocument = {
  schedule,
  workers,
  actors,
  auth,
}

export default googleApi
