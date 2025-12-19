'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Home, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const transactionId = searchParams.get('transactionId') || searchParams.get('txnid')
    const isTest = searchParams.get('test') === 'true'
    const amount = searchParams.get('amount')
    
    // If test mode, create mock transaction details
    if (isTest && transactionId && amount) {
      setTransactionDetails({
        transaction: {
          studentId: `VJ${Date.now()}`,
          transactionId: transactionId,
          paymentStatus: 'SUCCESS',
          amount: parseFloat(amount),
          studentName: 'Test Student',
          email: 'test@example.com',
          studentMobile: '9876543210',
          presentCollege: 'Test College',
          timestamp: new Date().toISOString(),
          fatherName: 'Test Father',
          motherName: 'Test Mother',
          countryPreference: 'Test Country'
        }
      })
      setLoading(false)
    } else if (transactionId && transactionId !== 'null') {
      fetchTransactionDetails(transactionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchTransactionDetails = async (transactionId: string, currentRetry: number = 0) => {
    try {
      const response = await fetch(`/api/payment/callback?transactionId=${transactionId}`)
      const data = await response.json()
      
      if (data.success && data.transaction) {
        setTransactionDetails(data)
        setErrorMessage(null)
        setLoading(false)
      } else if (currentRetry < 3) {
        // Retry up to 3 times with increasing delay
        const delay = (currentRetry + 1) * 2000
        console.log(`Transaction not found, retrying in ${delay}ms... (Attempt ${currentRetry + 1})`)
        setTimeout(() => {
          fetchTransactionDetails(transactionId, currentRetry + 1)
        }, delay)
      } else {
        setErrorMessage("Transaction confirmed by bank, but we're still syncing your details. Please refresh this page in a few seconds.")
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      setErrorMessage("Failed to connect to the server. Please check your connection and refresh.")
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!transactionDetails?.transaction) return
    setDownloading(true)
    
    // Simulate slight delay for effect
    setTimeout(() => {
    const receiptContent = `
VAIDYA JYOTHI SCHOLARSHIP - PAYMENT RECEIPT

============================================
Student Details
============================================
Student ID: ${transactionDetails.transaction.studentId}
Name: ${transactionDetails.transaction.studentName}
Email: ${transactionDetails.transaction.email}
Mobile: ${transactionDetails.transaction.studentMobile}

============================================
Payment Details
============================================
Transaction ID: ${transactionDetails.transaction.transactionId}
Payment Status: ${transactionDetails.transaction.paymentStatus}
Amount Paid: ₹${transactionDetails.transaction.amount}
Payment Date: ${new Date(transactionDetails.transaction.timestamp).toLocaleString()}

============================================
Application Details
============================================
Father Name: ${transactionDetails.transaction.fatherName}
Mother Name: ${transactionDetails.transaction.motherName}
College: ${transactionDetails.transaction.presentCollege}
Country Preference: ${transactionDetails.transaction.countryPreference}

============================================
Important Notes
============================================
- Please save this receipt for future reference
- Your Student ID: ${transactionDetails.transaction.studentId}
- Payment Status: ${transactionDetails.transaction.paymentStatus}
- For any queries, contact support

This is an electronically generated receipt.
Generated on: ${new Date().toLocaleString()}
    `.trim()

    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Vaidya_Jyothi_Receipt_${transactionDetails.transaction.studentId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    setDownloading(false)
    }, 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your scholarship application has been submitted successfully.</p>
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p className="font-semibold mb-1">⚠️ Notice</p>
              {errorMessage}
            </div>
          )}

          {searchParams.get('test') === 'true' && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-400 rounded-lg">
              <span className="text-yellow-800 text-sm font-medium">🧪 Test Mode - This is a simulated payment</span>
            </div>
          )}
        </div>

        {/* Success Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-green-700">Application Confirmed</CardTitle>
            <CardDescription>
              Your Vaidya Jyothi Scholarship application has been received and processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactionDetails?.transaction && (
              <>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-semibold text-green-700">{transactionDetails.transaction.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold">{transactionDetails.transaction.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-semibold text-green-600">{transactionDetails.transaction.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-semibold">₹{transactionDetails.transaction.amount}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{transactionDetails.transaction.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{transactionDetails.transaction.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{transactionDetails.transaction.studentMobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">College:</span>
                      <span className="font-medium">{transactionDetails.transaction.presentCollege}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Save your Student ID for future reference</li>
                <li>• You will receive updates on your email</li>
                <li>• Keep this receipt safe for your records</li>
                <li>• Contact support if you have any questions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={downloadReceipt}
            className="flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            disabled={!transactionDetails?.transaction || downloading}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? 'Downloading...' : 'Download Receipt'}
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-100 active:scale-95 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <a href="https://www.doctordreams.in" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-200 active:scale-95 w-full sm:w-auto">
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </Button>
          </a>
        </div>

        {/* Contact Information */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span>admissions@doctordreams.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span>+91-9035061122</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}