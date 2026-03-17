import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'

const REQUIRED_FIELDS = [
  'name',
  'email',
  'phoneNumber',
  'firstName',
  'lastName',
  'middleName',
]

export async function proxy(request: NextRequest) {
  let session = await auth.api.getSession({
    headers: await headers(),
  })

  if (
    !session &&
    request.nextUrl.pathname !== '/login' &&
    request.nextUrl.pathname !== '/register'
  ) {
    let destination: string | string[] = request.url.split('://')[1].split('/')
    destination.shift()
    destination = destination.join('/') || '/'

    let host = request.headers.get('host') || '127.0.0.1'

    const url = request.nextUrl.clone()

    url.pathname = `/login`
    url.host = host
    url.search = `?redirect=${destination}`

    return NextResponse.redirect(url)
  } else if (
    session &&
    // @ts-ignore
    REQUIRED_FIELDS.some(f => !session.user[f]) &&
    request.nextUrl.pathname !== '/register'
  ) {
    const url = request.nextUrl.clone()

    url.pathname = `/register`

    return NextResponse.redirect(url)
  } else if (
    session &&
    // @ts-ignore
    !REQUIRED_FIELDS.some(f => !session.user[f]) &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    const host = request.headers.get('host') || '127.0.0.1'

    const url = request.nextUrl.clone()

    url.pathname = `/`
    url.host = host

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|.*\\.svg|.*\\.svg=|_next/image|manifest\\.webmanifest|.*\\.png$).*)',
  ],
}
