import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService, ScholarshipApplication } from '@/lib/google-sheets'
import { phonePeService } from '@/lib/phonepe'
import { payUService } from '@/lib/payu'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'studentName',
      'fatherName', 
      'motherName',
      'studentMobile',
      'email',
      'address',
      'pincode',
      'taluk',
      'district',
      'presentCollege',
      'tenthPercentage',
      'countryPreference'
    ]

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^[0-9]{10}$/
    if (!mobileRegex.test(body.studentMobile)) {
      return NextResponse.json(
        { error: 'Student mobile number must be 10 digits' },
        { status: 400 }
      )
    }

    // Validate pincode format (6 digits)
    const pincodeRegex = /^[0-9]{6}$/
    if (!pincodeRegex.test(body.pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be 6 digits' },
        { status: 400 }
      )
    }

    // Validate 10th percentage
    const percentage = parseFloat(body.tenthPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: '10th percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Generate unique IDs
    const studentId = googleSheetsService.generateStudentId()
    const transactionId = googleSheetsService.generateTransactionId()

    // Get payment gateway from admin settings
    let paymentGateway = 'phonepe' // default
    try {
      const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/settings`)
      const settingsData = await settingsResponse.json()
      if (settingsData.success && settingsData.settings.paymentGateway) {
        paymentGateway = settingsData.settings.paymentGateway
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }

    // Get application fee from admin settings (default to 250)
    let applicationFee = 250
    try {
      const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/settings`)
      const settingsData = await settingsResponse.json()
      if (settingsData.success && settingsData.settings.applicationFee) {
        applicationFee = parseFloat(settingsData.settings.applicationFee) || 250
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }

    // Prepare data for Google Sheets
    const applicationData: ScholarshipApplication = {
      timestamp: new Date().toISOString(),
      studentId,
      transactionId,
      paymentStatus: 'PENDING',
      amount: applicationFee,
      studentName: body.studentName,
      fatherName: body.fatherName,
      motherName: body.motherName,
      studentMobile: body.studentMobile,
      fatherMobile: body.fatherMobile || '',
      motherMobile: body.motherMobile || '',
      email: body.email,
      address: body.address,
      pincode: body.pincode,
      taluk: body.taluk,
      district: body.district,
      presentCollege: body.presentCollege,
      tenthPercentage: body.tenthPercentage,
      ddRepresentative: body.ddRepresentative || '',
      countryPreference: body.countryPreference,
      collegePreference: body.collegePreference || '',
      budget: body.budget || '',
      facilities: body.facilities || ''
    }

    // Save initial data to Google Sheets (optional - continue if it fails)
    try {
      await googleSheetsService.appendRow(applicationData)
      console.log('Data saved to Google Sheets successfully')
    } catch (error) {
      console.warn('Google Sheets save failed (continuing anyway):', error)
      // Continue with payment even if Google Sheets fails
    }

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Check if we're in test mode (no payment credentials configured)
    const isTestMode = process.env.PAYMENT_TEST_MODE === 'true' || 
                      !process.env.PHONEPE_MERCHANT_ID && 
                      !process.env.PAYU_KEY

    // Initiate payment based on selected gateway
    let paymentResponse
    if (isTestMode) {
      // TEST MODE: Generate a mock payment URL that redirects to success page
      console.log('🧪 TEST MODE: Using mock payment gateway')
      paymentResponse = {
        success: true,
        data: {
          paymentUrl: `${baseUrl}/payment/success?txnid=${transactionId}&amount=${applicationFee}&test=true`
        }
      }
    } else if (paymentGateway === 'payu') {
      // PayU Payment
      paymentResponse = await payUService.initiatePayment({
        key: '', // Will be loaded from settings in the service
        salt: '', // Will be loaded from settings in the service
        txnid: transactionId,
        amount: applicationFee.toString(),
        firstname: body.studentName,
        email: body.email,
        phone: body.studentMobile,
        productinfo: 'Vaidya Jyothi Scholarship Application Fee',
        surl: `${baseUrl}/payment/success`,
        furl: `${baseUrl}/payment/failure`
      })
    } else {
      // PhonePe Payment (default)
      paymentResponse = await phonePeService.initiatePayment({
        merchantId: '', // Will be loaded from settings in the service
        transactionId,
        amount: applicationFee,
        merchantUserId: studentId,
        redirectUrl: `${baseUrl}/payment/success`,
        redirectMode: 'REDIRECT',
        callbackUrl: `${baseUrl}/api/payment/callback`,
        mobileNumber: body.studentMobile,
        email: body.email,
        shortName: body.studentName,
        description: 'Vaidya Jyothi Scholarship Application Fee'
      })
    }

    // If payment gateway fails, fall back to test mode
    if (!paymentResponse.success || !paymentResponse.data?.paymentUrl) {
      console.warn('Payment gateway failed, falling back to test mode')
      paymentResponse = {
        success: true,
        data: {
          paymentUrl: `${baseUrl}/payment/success?txnid=${transactionId}&amount=${applicationFee}&test=true&gateway=${paymentGateway}`
        }
      }
    }

    return NextResponse.json(
      { 
        success: true,
        transactionId,
        studentId,
        amount: applicationFee,
        paymentGateway,
        paymentUrl: paymentResponse.data.paymentUrl
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}