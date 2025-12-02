'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCw, Home, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailure() {
  const searchParams = useSearchParams()
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const txnId = searchParams.get('transactionId')
    setTransactionId(txnId)
    setLoading(false)
  }, [searchParams])

  const handleRetryPayment = () => {
    // Redirect back to the application form
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600">We couldn't process your payment. Please try again.</p>
        </div>

        {/* Failure Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-red-700">Transaction Details</CardTitle>
            <CardDescription>
              Your payment could not be completed. Please check the details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactionId && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-semibold">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-red-600">Failed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold">₹250</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Possible Reasons for Failure</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect payment details entered</li>
                <li>• Network connectivity issues</li>
                <li>• Bank server temporarily unavailable</li>
                <li>• Transaction timeout</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">What You Can Do</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your account balance and try again</li>
                <li>• Ensure you have stable internet connection</li>
                <li>• Use a different payment method if available</li>
                <li>• Contact your bank if the issue persists</li>
                <li>• Wait a few minutes before retrying</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button 
            onClick={handleRetryPayment}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Important Note */}
        <Card className="mb-6 bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Important Note</h3>
            <p className="text-sm text-orange-700">
              If your account was debited but the payment shows as failed, please don't worry. 
              The amount will be automatically refunded to your account within 5-7 working days. 
              If you don't receive the refund, please contact our support team with your transaction ID.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span>support@vaidyajyothi.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span>+91 98765 43210</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Please mention your Transaction ID: <span className="font-mono font-semibold">{transactionId || 'N/A'}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}