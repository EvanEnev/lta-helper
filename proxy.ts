import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import {AuthDataValidator, urlStrToAuthDataMap} from '@telegram-auth/server'
import crypto from 'crypto'

function generatePassword(
  telegramId: number | string,
  botToken: string,
): string {
  return crypto
    .createHmac('sha256', botToken)
    .update(telegramId.toString())
    .digest('hex')
}

export async function proxy(request: NextRequest) {
  let session = await auth.api.getSession({
    headers: await headers(),
  })

  const reqUrl = request.url
  const webAppData = reqUrl.split('tgWebAppData')[1]

  let user

  if (webAppData) {
    const hash = '#tgWebAppData' + webAppData
    const credentials =
      // @ts-ignore
      'https://lt.bubenev.su?' + urlParseHashParams(hash).tgWebAppData

    const validator = new AuthDataValidator({
      botToken: `${process.env.BOT_TOKEN}`,
    })

    const data = urlStrToAuthDataMap(credentials)

    try {
      user = await validator.validate(data)
    } catch (e) {
      console.error(e)
    }
  }

  if (!session && user) {
    const email =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
        ? `${user.id}@telegram-test.lta`
        : `${user.id}@telegram.lta`

    try {
      // @ts-ignore
      session = await auth.api.signInEmail({
        body: {
          email,
          password: generatePassword(user.id, process.env.BOT_TOKEN!),
          callbackURL: '/',
        },
        headers: await headers(),
      })
    } catch (e) {
      if (user.id == 791334723) {
        console.error(e)
      }

      // @ts-ignore
      session = await auth.api.signUpEmail({
        // @ts-ignore
        body: {
          email,
          name: user.username || 'undefined',
          password: generatePassword(user.id, process.env.BOT_TOKEN!),
          callbackURL: '/',
        },
      })
    }
  }

  if (
    !session &&
    request.nextUrl.pathname !== '/login' &&
    request.nextUrl.pathname !== '/register'
  ) {
    let destination: string | string[] = request.url.split('://')[1].split('/')
    destination.shift()
    destination = destination.join('/') || '/'

    let host = request.headers.get('host') || '127.0.0.1'

    if (host === 'localhost') {
      host = '127.0.0.1'
    }

    const url = request.nextUrl.clone()

    url.pathname = `/login`
    url.host = host
    url.search = `?redirect=${destination}`

    return NextResponse.redirect(url)
  } else if (session && request.nextUrl.pathname === '/login') {
    const host = request.headers.get('host') || '127.0.0.1'

    const url = request.nextUrl.clone()

    url.pathname = `/`
    url.host = host

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|.*\\.svg|_next/image|.*\\.png$).*)'],
}

function urlParseHashParams(locationHash: string) {
  locationHash = locationHash.replace(/^#/, '')
  const params = {}
  if (!locationHash.length) {
    return params
  }
  if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
    // @ts-ignore
    params._path = urlSafeDecode(locationHash)
    return params
  }
  const qIndex = locationHash.indexOf('?')
  if (qIndex >= 0) {
    const pathParam = locationHash.substr(0, qIndex)
    // @ts-ignore
    params._path = urlSafeDecode(pathParam)
    locationHash = locationHash.substr(qIndex + 1)
  }
  const query_params = urlParseQueryString(locationHash)
  for (const k in query_params) {
    // @ts-ignore
    params[k] = query_params[k]
  }
  return params
}

function urlParseQueryString(queryString: string) {
  const params = {}
  if (!queryString.length) {
    return params
  }
  const queryStringParams = queryString.split('&')
  let i, param, paramName, paramValue
  for (i = 0; i < queryStringParams.length; i++) {
    param = queryStringParams[i].split('=')
    paramName = urlSafeDecode(param[0])
    paramValue = param[1] == null ? null : urlSafeDecode(param[1])
    // @ts-ignore
    params[paramName] = paramValue
  }
  return params
}

function urlSafeDecode(urlencoded: string) {
  try {
    urlencoded = urlencoded.replace(/\+/g, '%20')
    return decodeURIComponent(urlencoded)
  } catch (e) {
    return urlencoded
  }
}
