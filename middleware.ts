// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // API routes must not be redirected by the admin-page middleware.
    // Their handlers perform their own authentication and return the appropriate API status.
    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    if (!request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.next()
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('🔐 MIDDLEWARE - User:', user?.id, user?.email)

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: userRow, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', user.id)
        .single()

    console.log('🔐 MIDDLEWARE - userRow:', userRow)
    console.log('🔐 MIDDLEWARE - error:', error)
    console.log('🔐 MIDDLEWARE - role:', userRow?.role)

    if (!userRow || userRow.role !== 'admin') {
        console.log('❌ NOT ADMIN - redirecting to /')
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (userRow.status === 'banned' || userRow.status === 'suspended') {
        console.log('❌ BANNED/SUSPENDED - redirecting to /')
        return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ ADMIN ACCESS GRANTED')
    return response
}

export const config = {
    matcher: '/admin/:path*',
}
