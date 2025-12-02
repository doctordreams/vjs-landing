import { NextRequest, NextResponse } from 'next/server'
import { getAdminCredentials, verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth'

// Simple in-memory rate limiting (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

function getRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now()
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes default
  const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5')

  const attemptData = loginAttempts.get(ip)

  if (!attemptData || now > attemptData.resetTime) {
    // Reset or initialize attempts
    loginAttempts.set(ip, { count: 0, resetTime: now + windowMs })
  }

  const currentData = loginAttempts.get(ip)!
  const allowed = currentData.count < maxAttempts
  const remainingAttempts = Math.max(0, maxAttempts - currentData.count)

  return {
    allowed,
    remainingAttempts,
    resetTime: currentData.resetTime
  }
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const attemptData = loginAttempts.get(ip)

  if (attemptData) {
    attemptData.count += 1
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check rate limit
    const rateLimit = getRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimit.remainingAttempts.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      recordFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get admin credentials
    const adminCredentials = getAdminCredentials()

    // Check username
    if (username !== adminCredentials.username) {
      recordFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, adminCredentials.passwordHash)
    if (!isValidPassword) {
      recordFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = createSessionToken(username)

    // Create success response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: { username }
      },
      { status: 200 }
    )

    // Set session cookie
    setSessionCookie(response, sessionToken)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
