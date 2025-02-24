import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.match(/\/output_tiles\/\d+\/\d+\/\d+\.pbf$/)) {
    const response = NextResponse.next()
    response.headers.set('Content-Type', 'application/x-protobuf')
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Cache-Control', 'public, max-age=31536000')
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/output_tiles/:path*',
} 