import { NextRequest, NextResponse } from 'next/server'
import { getSessionData } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionData = getSessionData(request)

    if (!sessionData) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          username: sessionData.username
        },
        loginTime: sessionData.loginTime,
        expiresAt: sessionData.expiresAt
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



