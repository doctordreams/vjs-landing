import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'
import { payUService } from '@/lib/payu'

export async function POST(request: NextRequest) {
  try {
    // PayU sends data as application/x-www-form-urlencoded
    const formData = await request.formData()
    const body: any = {}
    formData.forEach((value, key) => {
      body[key] = value
    })

    console.log('--- PAYU CALLBACK DEBUG ---')
    console.log('Callback Data:', JSON.stringify(body, null, 2))

    // Trim for consistency
    const rawTxnid = body.txnid
    const txnid = String(rawTxnid || '').trim()
    const { status, amount } = body

    if (!txnid) {
       console.error('Missing txnid in PayU callback')
       return NextResponse.redirect(new URL('/payment/failure?error=missing_id', request.url))
    }

    console.log(`[PayU Callback] Processing TXN ID: "${txnid}"`)
    
    const isSuccess = status === 'success' || status === 'completed'
    const finalStatus = isSuccess ? 'SUCCESS' : 'FAILED'

    // Update payment status in Google Sheets (Trimming here too)
    try {
      await googleSheetsService.updatePaymentStatus(txnid, finalStatus)
      console.log(`[PayU Callback] Status updated to ${finalStatus} for "${txnid}"`)
    } catch (err) {
      console.error(`[PayU Callback] Failed to update status for "${txnid}":`, err)
    }

    // Build redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    const redirectUrl = new URL(isSuccess ? '/payment/success' : '/payment/failure', baseUrl)
    redirectUrl.searchParams.set('transactionId', txnid)
    redirectUrl.searchParams.set('status', finalStatus)
    redirectUrl.searchParams.set('amount', amount || '1')

    console.log(`[PayU Callback] Redirecting to: ${redirectUrl.toString()}`)

    // Perform browser redirect (303 See Other is best for POST to GET)
    return NextResponse.redirect(redirectUrl.toString(), 303)

  } catch (error) {
    console.error('Error processing PayU callback:', error)
    // Fallback redirect to home or failure
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    return NextResponse.redirect(new URL('/payment/failure?error=system_error', baseUrl), 303)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawTxnid = searchParams.get('transactionId') || searchParams.get('txnid')
    const txnid = String(rawTxnid || '').trim()

    if (!txnid) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    console.log(`[PayU-GET] Checking data for: "${txnid}"`)

    // Check payment status (best effort)
    let paymentStatus = 'unknown'
    try {
      const statusResponse = await payUService.checkPaymentStatus(txnid)
      if (statusResponse.success) {
        paymentStatus = statusResponse.data?.status || 'unknown'
      }
    } catch (err) {
      console.warn('[PayU-GET] Payment status check failed:', err)
    }

    // Get transaction details from Google Sheets
    let transaction = await googleSheetsService.getTransaction(txnid)

    // FALLBACK: If not in Sheets, check Prisma
    if (!transaction) {
      console.warn(`[PayU-GET] Transaction "${txnid}" not found in Google Sheets, trying Prisma...`)
      try {
        const { db } = await import('@/lib/db')
        const dbRecord = await db.scholarshipApplication.findUnique({
          where: { transactionId: txnid }
        })
        
        if (dbRecord) {
          console.log(`[PayU-GET] Found record in Prisma for "${txnid}"`)
          transaction = dbRecord as any
        } else {
           console.warn(`[PayU-GET] Transaction "${txnid}" NOT found in Prisma either`)
        }
      } catch (dbErr) {
        console.error('[PayU-GET] Prisma fallback lookup failed:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus: paymentStatus !== 'unknown' ? paymentStatus : (transaction?.paymentStatus || 'unknown'),
      transaction: transaction,
    })

  } catch (error) {
    console.error('Error checking PayU payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}