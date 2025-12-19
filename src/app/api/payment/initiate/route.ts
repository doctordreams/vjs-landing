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

    // Get base URL - CRITICAL for production
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    
    // Fallback for local development
    if (!baseUrl || baseUrl === 'null' || baseUrl === 'undefined') {
      baseUrl = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'http://localhost:3000'
    }
    
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, '')
    
    if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === 'production') {
      console.error('⚠️ CRITICAL: NEXT_PUBLIC_APP_URL not set in production!')
      // But we proceed with the fallback if possible
    }

    // Get payment gateway from admin settings
    let paymentGateway = 'phonepe' // default
    try {
      const settingsUrl = baseUrl ? `${baseUrl}/api/admin/settings` : '/api/admin/settings'
      const settingsResponse = await fetch(settingsUrl)
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
      const settingsUrl = baseUrl ? `${baseUrl}/api/admin/settings` : '/api/admin/settings'
      const settingsResponse = await fetch(settingsUrl)
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
      countryPreference: Array.isArray(body.countryPreference) ? body.countryPreference.join(', ') : body.countryPreference,
      collegePreference: '', // Removed - now in comments
      budget: '', // Removed - now in comments
      facilities: '', // Removed - now in comments
      comments: body.comments || ''
    }

    // Create Prisma record (Dual Storage)
    let prismaSaved = false
    try {
      const { db } = await import('@/lib/db')
      
      await db.scholarshipApplication.create({
        data: {
          studentId: applicationData.studentId,
          transactionId: applicationData.transactionId,
          paymentStatus: applicationData.paymentStatus,
          amount: applicationData.amount,
          studentName: applicationData.studentName,
          fatherName: applicationData.fatherName,
          motherName: applicationData.motherName,
          studentMobile: applicationData.studentMobile,
          fatherMobile: applicationData.fatherMobile,
          motherMobile: applicationData.motherMobile,
          email: applicationData.email,
          address: applicationData.address,
          pincode: applicationData.pincode,
          taluk: applicationData.taluk,
          district: applicationData.district,
          presentCollege: applicationData.presentCollege,
          tenthPercentage: applicationData.tenthPercentage,
          ddRepresentative: applicationData.ddRepresentative,
          countryPreference: applicationData.countryPreference,
          collegePreference: applicationData.collegePreference,
          budget: applicationData.budget,
          facilities: applicationData.facilities,
          comments: applicationData.comments
        }
      })
      console.log('Data saved to Prisma DB successfully')
      prismaSaved = true
    } catch (error) {
       console.error('Prisma DB save failed:', error)
       // We continue for now, but rely on sheetsSaved if this fails
    }

    // Save data to Google Sheets
    let sheetsSaved = false
    try {
      await googleSheetsService.appendRow(applicationData)
      console.log('Data saved to Google Sheets successfully')
      sheetsSaved = true
    } catch (error) {
      console.warn('Google Sheets save failed:', error)
    }

    // CRITICAL: Ensure at least one storage succeeded before proceeding to payment
    if (!prismaSaved && !sheetsSaved) {
      console.error('⚠️ CRITICAL: BOTH storage systems failed! Blocking payment initiation.')
      return NextResponse.json(
        { error: 'System error: Failed to save application data. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Base URL already set above - reuse it

    // Check if we're in test mode (no payment credentials configured)
    const paymentTestMode = process.env.PAYMENT_TEST_MODE
    const payuKey = process.env.PAYU_KEY
    
    console.log('--- DEBUG PAYMENT ENV ---')
    console.log('PAYMENT_TEST_MODE:', paymentTestMode)
    console.log('PAYU_KEY exists:', !!payuKey)
    console.log('PAYU_KEY length:', payuKey ? payuKey.length : 0)
    console.log('-------------------------')

    const isTestMode = paymentTestMode === 'true' || !payuKey

    // STRICTLY USE PAYU AS PER USER REQUEST
    paymentGateway = 'payu' 
    
    // Initiate payment based on selected gateway
    let paymentResponse
    if (isTestMode) {
      // TEST MODE: Generate a mock payment URL that redirects to success page
      console.log('🧪 TEST MODE: Using mock payment gateway')
      paymentResponse = {
        success: true,
        data: {
          paymentUrl: `${baseUrl}/payment/success?txnid=${transactionId}&amount=${applicationFee}&test=true&gateway=payu`
        }
      }
    } else {
      // PayU Payment (Default)
      console.log('Using PayU Gateway')
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
      
      /* PHONEPE COMMENTED OUT AS PER REQUEST
      
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
      */
    }

    // Verify payment response structure
    if (!paymentResponse || !paymentResponse.success) {
      console.error('Payment Gateway Error:', paymentResponse)
      return NextResponse.json(
        { error: paymentResponse?.message || 'Payment gateway failed to initialize' },
        { status: 500 }
      )
    }

    const paymentUrl = paymentResponse.data?.paymentUrl || ''

    return NextResponse.json(
      { 
        success: true,
        transactionId,
        studentId,
        amount: applicationFee,
        paymentGateway,
        paymentUrl,
        sheetsSaved,
        // Pass all PayU parameters to the frontend for Form POST
        payuParams: paymentResponse.data
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