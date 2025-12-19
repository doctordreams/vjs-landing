import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'
import { phonePeService } from '@/lib/phonepe'
import { payUService } from '@/lib/payu'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const receivedHash = request.headers.get('x-verify') || request.headers.get('X-VERIFY')

    if (!receivedHash) {
      console.error('Missing hash in payment callback')
      return NextResponse.json({ error: 'Missing hash' }, { status: 400 })
    }

    // Check if it's PhonePe or PayU callback
    const isPhonePeCallback = body.transactionId && body.code
    const isPayUCallback = body.txnid && body.miPayId

    if (isPhonePeCallback) {
      // Handle PhonePe callback
      const isValidHash = phonePeService.validateCallback(body, receivedHash)
      if (!isValidHash) {
        console.error('Invalid PhonePe callback hash')
        return NextResponse.json({ error: 'Invalid hash' }, { status: 400 })
      }

      const { transactionId, code, amount } = body

      // Update payment status in Google Sheets
      if (code === 'PAYMENT_SUCCESS' || code === 'PAYMENT_PENDING') {
        await googleSheetsService.updatePaymentStatus(transactionId, 'SUCCESS')
        console.log(`PhonePe payment successful for transaction: ${transactionId}`)
      } else {
        await googleSheetsService.updatePaymentStatus(transactionId, 'FAILED')
        console.log(`PhonePe payment failed for transaction: ${transactionId}, code: ${code}`)
      }

      return NextResponse.json({ 
        success: true,
        message: 'PhonePe callback processed successfully'
      })

    } else if (isPayUCallback) {
      // Handle PayU callback
      const callbackData = payUService.parseCallbackData(body) as any
      if (!callbackData) {
        console.error('Invalid PayU callback data format')
        return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 })
      }

      // Validate hash
      const isValidHash = payUService.validateCallback(callbackData, receivedHash)
      if (!isValidHash) {
        console.error('Invalid PayU callback hash')
        return NextResponse.json({ error: 'Invalid hash' }, { status: 400 })
      }

      const txnid = String(callbackData.txnid || '').trim()
      const status = String(callbackData.status || '').toLowerCase()
      const amount = callbackData.amount

      // Update payment status in Google Sheets
      if (status === 'success' || status === 'completed') {
        await googleSheetsService.updatePaymentStatus(txnid, 'SUCCESS')
        console.log(`PayU payment successful for transaction: ${txnid}`)
      } else {
        await googleSheetsService.updatePaymentStatus(txnid, 'FAILED')
        console.log(`PayU payment failed for transaction: ${txnid}, status: ${status}`)
      }

      return NextResponse.json({ 
        success: true,
        txnid,
        status: 'received',
        message: 'PayU callback processed successfully'
      })

    } else {
      console.error('Unknown payment callback type')
      return NextResponse.json({ error: 'Unknown payment callback type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing payment callback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txnid = searchParams.get('transactionId') || searchParams.get('txnid')

    if (!txnid) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Check payment status (best effort)
    let paymentStatus = 'unknown'
    try {
      const statusResponse = await payUService.checkPaymentStatus(txnid)
      if (statusResponse.success) {
        paymentStatus = statusResponse.data?.status || 'unknown'
      }
    } catch (err) {
      console.warn('Payment status check failed (using stored status):', err)
    }

    // Get transaction details from Google Sheets
    console.log(`[Callback GET] Searching for transactionId: "${txnid}"`)
    let transaction = await googleSheetsService.getTransaction(txnid)

    // FALLBACK: If not in Sheets, check Prisma
    if (!transaction) {
      console.warn(`[Callback GET] Transaction "${txnid}" not found in Google Sheets, trying Prisma...`)
      try {
        const { db } = await import('@/lib/db')
        const dbRecord = await db.scholarshipApplication.findUnique({
          where: { transactionId: txnid }
        })
        
        if (dbRecord) {
          console.log(`[Callback GET] Found record in Prisma for "${txnid}"`)
          transaction = dbRecord as any
        } else {
          console.warn(`[Callback GET] Transaction "${txnid}" NOT found in Prisma`)
        }
      } catch (dbErr) {
        console.error('[Callback GET] Prisma fallback lookup failed:', dbErr)
      }
    }

    if (!transaction) {
       console.warn(`Transaction ${txnid} not found in any storage source`)
    }

    return NextResponse.json({
      success: true,
      paymentStatus: paymentStatus !== 'unknown' ? paymentStatus : (transaction?.paymentStatus || 'unknown'),
      transaction: transaction,
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}