import {GoogleAuth, JWT} from 'google-auth-library'
import {GoogleSpreadsheet} from 'google-spreadsheet'
import {google as rawGoogle} from 'googleapis'

export interface GoogleDocument {
  schedule: GoogleSpreadsheet
  workers: GoogleSpreadsheet
  actors: GoogleSpreadsheet
  auth: GoogleAuth
}

const credentials = {
  type: 'service_account',
  project_id: 'lt-arena-426723',
  private_key_id: '9af53a63932751cf47546c8a5a564580b933334c',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLYXzt9PPWhEb3\npb/V4nuZe5UXS2mHkQpEB6BQ1I6MqTb6Yxl11e+7X1BZvlOGKu/sb1UZmpvRdZm5\n2u7p1vUeZwAS4D95DHrFSuMaW1lebvfjtZQF0RyvDf6kl6B5u4gPkncES68pmlYK\n1FIovuKSNYS9bejWqGZd7bZvxemK/MIIvptA3W3VATZtFcALjqyqMKydDHazSaXK\nN2fEtIHuRkFW6xNDk3d7XBCiE0trWDLz3vTtRLI6jA8E/PAJ+NkIRJ7sabYHRFT+\npB7Zbo9GV3x4vIW4QLHj/AxhEjvW9G/YlISQwjg45hctp0g+9e/UVL9ykRZw/Ug+\n8YidBZnHAgMBAAECggEAWzRRL27pSFpSbu0sDZD+x5H1hphBb1N6LI7U9FqVwHuD\n1Z5KRR8W3kp8gHpK/4BSzo8QtSYx2SkpMoD9Ie1NSAB9tnlMzY5sofwWwvOTLLeL\nv9hmVIN1nwUiHBKJGv4foogWil0cZIY7LqkPXQlZFqMcb0ySHW0wVs/qv84bkMFB\nnxDB72hrOKoWS0A+ODDGw2ft42E/Wgdkhb9exthHvUV3x2NS1R+gv82VhhswTWua\nWTN3OXUkcz2I+u4evHYeEbBBJqW1PPHzr+ILrFG9DmG6tDVenZxhelaKPfKO0YlQ\nl+/cBA1c6JKSQ4X/rbmfDLn/wBUF1OV4l150OiHBsQKBgQDMGD6d+uyEUWKowwXI\nDzelMFGyaYhW5lZcg86y7b12chO+sjDLDkEsCH82aQi4gDm8Bsh9VnFUVMn9uOZD\n3+Rkf9T7acH0LK5e4JiPu/nHrx9LMwIkIhXrMU42yoIjeUOpPIqVIjYLMjzbqyy/\nxwLHGLHVip6X9DqaOZ1XheOCdwKBgQD/GsPK6Dh/whJVv4DQj+f6bivGrgMTIygu\nTSx48Zw4ASmn0226InWCJt091wGODFrnr7x+/mwB94ce/ZZ7SvoLXyQE4w+flKfN\nzCaFrsNBJV+4bBEs0oS6zT8GstW4kyM4BO6kG5SIttvwMVUzut3KJVxcyPYWhLXq\nHLvdShKnMQKBgQCsMvyKEI+EKKLEXx++p1A82OLlVHNLVrahAjjg8QP9Ls0IBZJz\nkMheHaEvyDkqak3MHjEEx22BSLTQlTP7KqmqPcz2f0m8+gH5XSh7hY9+8nvF1/jD\ngdragNRMGFrrEUKMRN9satwMYEvGz8tG1+O5FlXdJUMgVFkpjNj7YqUNiwKBgQCU\nhfSwUftzBn6+RbytsNsSxsnd5roLjlB6hJv73k9hm+uwtjwQPrfDivUMZ/2TwkW6\n1mocVex0SLT2qhXOupxRupax8bDK7DW2b8GN2236o9PS/7gQLJDyYUTslXow+Blt\nKBH4ocYcwrnSYiaE86rlYlMgAjCkc6emIgyOje3GQQKBgDox2um63Uvq+LCVNf2I\nq1tdFoUyXao4IW+ZpItp2gn9BgCRSJN3vb/ZDz6DGh2w0jKI9R80afS/qZCaDylm\njKcXhRsZEwT1AJvgYIQUH2oWhNn5tL2a0Mg/El6i/wxXgWGQ3glCukmUmrZqW6Kk\neltaYjUVCsfCgmdj5A3Wsd4e\n-----END PRIVATE KEY-----\n',
  client_email: 'schedule@lt-arena-426723.iam.gserviceaccount.com',
  client_id: '105873889181002237295',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/schedule%40lt-arena-426723.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
}

let cachedGoogle: GoogleDocument

export default function google(): GoogleDocument {
  if (
    cachedGoogle &&
    cachedGoogle.actors &&
    cachedGoogle.workers &&
    cachedGoogle.schedule
  ) {
    return cachedGoogle
  } else {
    const serviceAccountAuth = new JWT({
      email: 'schedule@lt-arena-426723.iam.gserviceaccount.com',
      key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCiKDKEiwm+V1vO\n2A1VgkwSU7yQXGZG0vhRdRBlpTSrfz7mxhChWT0VzfZ1kFBGwZuFXiKZ5O1afzM2\niMWiQ18+hTV21X6pNKSH8wpXDNrFh2CljMlOtzBxfntkP6L3ZkgeVOIrxqwVk8UE\nAE0YZRJTS7+4FmugNrRYl3Ne1lXI3Ra1fi3O7UgYdgVN7Opav5fsgR+zLo5REctj\nC5oIxMq1rRyJXLOTzpaphOmPwTYNlb7Mja2UjgrUUA6XxH1TDaOpHt9mwuvc5rgM\nBQz7KxIqQnFxAGtDNmJgVKEwtAbU7WvyaveTepsFxXIoNcm8Djem0h6oTxM04pZx\n4ngqFB79AgMBAAECggEAKVrrF1aGU57f8S60p9wlHn9wlbia9PEVF2Etn160whAf\nsKdO0nd51rfCZVU6w/DYgvjxBiKWTgAmxX+4N5vLDJzYd8gXF3wvgeR//Jdwq/PM\nuCvho0ug9TD2syhvnXzeY63uSI/Qj2gyVMTm5JPSSqAE8yP0qtWIxRdK+yLamfEw\nQV6NA209aXJhKsOfTaShuxrB7WRvGQIsEUN1rESnGKOC1858b9Zt5556VmJygOkA\nFvuuV/dNVNx6kpslf6Jf6JpHJzX28xBPqNzrh2cKOVxIb62ODFp4Q+5HoEhqrLZj\npsbKs53XDU6xUvF94xwCnZzgXfEh3XLtrNuDBTNJmQKBgQDh3KTabuEthKcTl8ER\nw5alYDHmiCln51jYAYEy5cOekKr8N3x6Arm4cgy5fRK1INJUZeqHvIACpo0uUBy0\n4Bo69QWF1Lqb13YOwv4zvrK8kvgkRhJO222NRRf8oVEwgnedYM3s35LZRVWOlkiu\nVLGmnS9pqQSIJfvpQoWM/UcXywKBgQC3y2tY64vMyieOWexXwmJVKOXcUS7tC8Bo\nn0X8K6NacR88TFdx3X9iB51oVSSsEOMi1600rP2AOhv3LUEJztI1txkjojCIAKwz\nZDhQm6sw2xqb5SX1iJWinfheXwvqrP67GVdrxcGMGILHo2e33jBGg2jXcmMVS8mO\n1Lt8DuX7VwKBgQC4AZoMmui4vKmhPLD+V+oTMRt2RNf23nNzB0bKwIVuWU3zzQCM\nJkxICCJ1u3/SMLsqJx27F8byYd4DLSE1+p1kCtpE/dpJvG9h91pBrcrP9qxSYQPp\nWrsVrISuPH54ltH8VTFvGXX5rJLXZ3gvDrDsnIJUAm6+vLNOhfNnubCBoQKBgQCi\nIKPh/W4FyXGZRcORKpx5SKlzbn25hvtEjvM6XfgsKMuH8kPU4rGidNsqlKjTy9XA\n/4X/iHXaLehLYzUTBMkzrv9TCphK8GT2tHpkyNz7LNvNFxcj/0cX+seD383wRogx\n3UnbfMed4GVE2+T7Mdld6j+KhZHX0FHNV+TGq5G94wKBgQDN8IbcLCHSX9V6AlyM\ni/wd2B5O0BYuEZ3e7HDB1Qj7/blZA+TuC6OesXzHLoj/s6w9KKucjbr/4mMVjv4W\nrNvVAWyLcYDUJV3H+hmiDoaLKVL6UGx4II8S5M8R3707AGMnnbzv5+MaRTDuwcY1\nF8EJ7yj4S5+F9InivRaVtbrQbQ==\n-----END PRIVATE KEY-----\n',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const schedule = new GoogleSpreadsheet(
      process.env.SCHEDULE_SHEET_ID || '',
      serviceAccountAuth,
    )

    const workers = new GoogleSpreadsheet(
      process.env.WORKERS_SHEET_ID || '',
      serviceAccountAuth,
    )

    const actors = new GoogleSpreadsheet(
      process.env.ACTORS_SHEET_ID || '',
      serviceAccountAuth,
    )

    const auth = new rawGoogle.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const google: GoogleDocument = {schedule, workers, actors, auth}

    cachedGoogle = google
    return google
  }
}
