import {NextRequest, NextResponse} from 'next/server'

export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers)
  headers.set('x-current-path', req.nextUrl.pathname)
  return NextResponse.next({headers})
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
