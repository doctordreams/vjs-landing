import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // This endpoint is now deprecated - use /api/payment/initiate instead
    return NextResponse.json(
      { 
        error: 'This endpoint is deprecated. Please use /api/payment/initiate for scholarship applications with payment.',
        message: 'The scholarship application process now includes a mandatory payment step. Please use the updated form.',
        newEndpoint: '/api/payment/initiate'
      },
      { status: 301 }
    )

  } catch (error) {
    console.error('Error in scholarship endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}