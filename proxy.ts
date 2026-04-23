// Uncomment this file when you wire up Supabase Auth in Day 2.
//
// NOTE: Next.js 16 renamed middleware.ts → proxy.ts.
// The exported function is also renamed: middleware() → proxy().
// Everything else (matcher config, request/response handling) is identical.
//
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
