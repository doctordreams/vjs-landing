import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful'
      },
      { status: 200 }
    )

    // Clear session cookie
    clearSessionCookie(response)

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



