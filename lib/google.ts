import {JWT} from 'google-auth-library'
import {GoogleSpreadsheet} from 'google-spreadsheet'

export default function google() {
  const cached = (global as any).google
  if (cached) {
    return cached
  } else {
    const serviceAccountAuth = new JWT({
      email: 'schedule@lt-arena-426723.iam.gserviceaccount.com',
      key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCiKDKEiwm+V1vO\n2A1VgkwSU7yQXGZG0vhRdRBlpTSrfz7mxhChWT0VzfZ1kFBGwZuFXiKZ5O1afzM2\niMWiQ18+hTV21X6pNKSH8wpXDNrFh2CljMlOtzBxfntkP6L3ZkgeVOIrxqwVk8UE\nAE0YZRJTS7+4FmugNrRYl3Ne1lXI3Ra1fi3O7UgYdgVN7Opav5fsgR+zLo5REctj\nC5oIxMq1rRyJXLOTzpaphOmPwTYNlb7Mja2UjgrUUA6XxH1TDaOpHt9mwuvc5rgM\nBQz7KxIqQnFxAGtDNmJgVKEwtAbU7WvyaveTepsFxXIoNcm8Djem0h6oTxM04pZx\n4ngqFB79AgMBAAECggEAKVrrF1aGU57f8S60p9wlHn9wlbia9PEVF2Etn160whAf\nsKdO0nd51rfCZVU6w/DYgvjxBiKWTgAmxX+4N5vLDJzYd8gXF3wvgeR//Jdwq/PM\nuCvho0ug9TD2syhvnXzeY63uSI/Qj2gyVMTm5JPSSqAE8yP0qtWIxRdK+yLamfEw\nQV6NA209aXJhKsOfTaShuxrB7WRvGQIsEUN1rESnGKOC1858b9Zt5556VmJygOkA\nFvuuV/dNVNx6kpslf6Jf6JpHJzX28xBPqNzrh2cKOVxIb62ODFp4Q+5HoEhqrLZj\npsbKs53XDU6xUvF94xwCnZzgXfEh3XLtrNuDBTNJmQKBgQDh3KTabuEthKcTl8ER\nw5alYDHmiCln51jYAYEy5cOekKr8N3x6Arm4cgy5fRK1INJUZeqHvIACpo0uUBy0\n4Bo69QWF1Lqb13YOwv4zvrK8kvgkRhJO222NRRf8oVEwgnedYM3s35LZRVWOlkiu\nVLGmnS9pqQSIJfvpQoWM/UcXywKBgQC3y2tY64vMyieOWexXwmJVKOXcUS7tC8Bo\nn0X8K6NacR88TFdx3X9iB51oVSSsEOMi1600rP2AOhv3LUEJztI1txkjojCIAKwz\nZDhQm6sw2xqb5SX1iJWinfheXwvqrP67GVdrxcGMGILHo2e33jBGg2jXcmMVS8mO\n1Lt8DuX7VwKBgQC4AZoMmui4vKmhPLD+V+oTMRt2RNf23nNzB0bKwIVuWU3zzQCM\nJkxICCJ1u3/SMLsqJx27F8byYd4DLSE1+p1kCtpE/dpJvG9h91pBrcrP9qxSYQPp\nWrsVrISuPH54ltH8VTFvGXX5rJLXZ3gvDrDsnIJUAm6+vLNOhfNnubCBoQKBgQCi\nIKPh/W4FyXGZRcORKpx5SKlzbn25hvtEjvM6XfgsKMuH8kPU4rGidNsqlKjTy9XA\n/4X/iHXaLehLYzUTBMkzrv9TCphK8GT2tHpkyNz7LNvNFxcj/0cX+seD383wRogx\n3UnbfMed4GVE2+T7Mdld6j+KhZHX0FHNV+TGq5G94wKBgQDN8IbcLCHSX9V6AlyM\ni/wd2B5O0BYuEZ3e7HDB1Qj7/blZA+TuC6OesXzHLoj/s6w9KKucjbr/4mMVjv4W\nrNvVAWyLcYDUJV3H+hmiDoaLKVL6UGx4II8S5M8R3707AGMnnbzv5+MaRTDuwcY1\nF8EJ7yj4S5+F9InivRaVtbrQbQ==\n-----END PRIVATE KEY-----\n',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const google = new GoogleSpreadsheet(
      process.env.SHEET_ID || '',
      serviceAccountAuth,
    )

    ;(global as any).google = google
    return google
  }
}
