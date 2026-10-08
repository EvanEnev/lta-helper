import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'

const AUTH_PAGES = ['/login', '/register']

function redirectTo(request: NextRequest, pathname: string, search = '') {
  const url = request.nextUrl.clone()

  url.pathname = pathname
  url.search = search

  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})

  const {pathname, search} = request.nextUrl
  const isAuthPage = AUTH_PAGES.includes(pathname)

  if (pathname === '/register') return redirectTo(request, '/login')

  if (!session) {
    if (isAuthPage) return NextResponse.next()

    const back = `${pathname}${search}`

    return redirectTo(
      request,
      '/login',
      back === '/' ? '' : `?redirect=${encodeURIComponent(back)}`,
    )
  }

  if (!session.user.isApproved) {
    return pathname === '/login'
      ? NextResponse.next()
      : redirectTo(request, '/login')
  }

  if (isAuthPage) return redirectTo(request, '/')

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|.*\\.svg|.*\\.svg=|_next/image|manifest\\.webmanifest|.*\\.png$).*)',
  ],
}
