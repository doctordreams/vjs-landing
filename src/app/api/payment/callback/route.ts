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
      const callbackData = payUService.parseCallbackData(body)
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

      const { txnid, status, amount } = callbackData

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
    const txnid = searchParams.get('txnid')

    if (!txnid) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Check payment status
    const statusResponse = await payUService.checkPaymentStatus(txnid)
    
    if (!statusResponse.success) {
      return NextResponse.json(
        { error: 'Failed to check payment status' },
        { status: 500 }
      )
    }

    // Get transaction details from Google Sheets
    const transaction = await googleSheetsService.getTransaction(txnid)

    return NextResponse.json({
      success: true,
      paymentStatus: statusResponse.data?.status || 'unknown',
      transaction: transaction,
      details: statusResponse.data
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}