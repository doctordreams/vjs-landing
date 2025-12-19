import { NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'

export async function GET() {
  try {
    const testData: any = {
      timestamp: new Date().toISOString(),
      studentId: 'TEST-DEBUG-ID',
      transactionId: 'TEST-TXN-ID',
      paymentStatus: 'PENDING',
      amount: 100,
      studentName: 'Debug User',
      fatherName: 'Debug Father',
      motherName: 'Debug Mother',
      studentMobile: '0000000000',
      email: 'debug@test.com',
      // ... fill other required fields with dummy data
      fatherMobile: '',
      motherMobile: '',
      address: 'Test Address',
      pincode: '000000',
      taluk: 'Test Taluk',
      district: 'Test District',
      presentCollege: 'Test College',
      tenthPercentage: '99',
      ddRepresentative: '',
      countryPreference: 'TEST',
      collegePreference: '',
      budget: '',
      facilities: '',
      comments: 'This is a debug test row'
    }

    console.log('--- STARTING SHEET DEBUG TEST ---')
    await googleSheetsService.appendRow(testData)
    console.log('--- SHEET DEBUG TEST SUCCESS ---')

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully appended row to Google Sheet. Check your sheet!' 
    })
  } catch (error: any) {
    console.error('--- SHEET DEBUG TEST FAILED ---', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      details: 'Check server console for full error object'
    }, { status: 500 })
  }
}
