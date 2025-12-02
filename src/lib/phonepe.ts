import crypto from 'crypto'
import axios from 'axios'
import { getAdminSetting } from './admin-settings'

export interface PhonePePaymentRequest {
  merchantId: string
  transactionId: string
  amount: number
  merchantUserId: string
  redirectUrl: string
  redirectMode: string
  callbackUrl: string
  mobileNumber: string
  email: string
  shortName: string
  description: string
}

export interface PhonePePaymentResponse {
  success: boolean
  code?: string
  message?: string
  data?: {
    merchantId: string
    transactionId: string
    amount: number
    paymentInstrument?: {
      type: string
    }
    redirectInfo?: {
      url: string
      method: string
    }
  }
}

export interface PhonePeCallbackData {
  code: string
  merchantId: string
  transactionId: string
  amount: number
  providerReferenceId?: string
  paymentState: string
  payResponseCode?: string
  responseCode?: string
  responseMessage?: string
  date?: string
}

class PhonePeService {
  private merchantId: string
  private saltKey: string
  private baseUrl: string
  private saltIndex: string

  constructor() {
    // Load settings from environment variables or admin settings
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || this.getStoredSetting('phonepeMerchantId') || ''
    this.saltKey = process.env.PHONEPE_SALT_KEY || this.getStoredSetting('phonepeSaltKey') || ''
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || this.getStoredSetting('phonepeSaltIndex') || '1'
    
    // PhonePe Base URL - Use production URL: https://api.phonepe.com (or test: https://api-preprod.phonepe.com)
    this.baseUrl = process.env.PHONEPE_BASE_URL || this.getStoredSetting('phonepeBaseUrl') || 
      (process.env.NODE_ENV === 'production' ? 'https://api.phonepe.com' : 'https://api-preprod.phonepe.com')
  }

  private getStoredSetting(key: string): string {
    return getAdminSetting(key as keyof import('./admin-settings').AdminSettings)
  }

  private generateChecksum(payload: string): string {
    const checksumString = payload + '/pg/v1/pay' + this.saltKey
    return crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + this.saltIndex
  }

  private validateChecksum(payload: string, receivedChecksum: string): boolean {
    const expectedChecksum = this.generateChecksum(payload)
    return expectedChecksum === receivedChecksum
  }

  async initiatePayment(paymentRequest: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: paymentRequest.transactionId,
        amount: paymentRequest.amount * 100, // PhonePe expects amount in paise
        merchantUserId: paymentRequest.merchantUserId,
        redirectUrl: paymentRequest.redirectUrl,
        redirectMode: paymentRequest.redirectMode,
        callbackUrl: paymentRequest.callbackUrl,
        mobileNumber: paymentRequest.mobileNumber,
        email: paymentRequest.email,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      }

      const payloadString = JSON.stringify(payload)
      const checksum = this.generateChecksum(payloadString)

      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        {
          request: Buffer.from(payloadString).toString('base64')
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      )

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          code: response.data.code,
          message: response.data.message
        }
      }
    } catch (error) {
      console.error('PhonePe payment initiation error:', error)
      return {
        success: false,
        message: 'Failed to initiate payment'
      }
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PhonePePaymentResponse> {
    try {
      const endpoint = `/pg/v1/status/${this.merchantId}/${transactionId}`
      const checksumString = endpoint + this.saltKey
      const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + this.saltIndex

      const response = await axios.get(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      )

      return {
        success: response.data.success,
        data: response.data.data,
        code: response.data.code,
        message: response.data.message
      }
    } catch (error) {
      console.error('PhonePe status check error:', error)
      return {
        success: false,
        message: 'Failed to check payment status'
      }
    }
  }

  validateCallback(callbackData: any, receivedChecksum: string): boolean {
    try {
      const payloadString = JSON.stringify(callbackData)
      return this.validateChecksum(payloadString, receivedChecksum)
    } catch (error) {
      console.error('Callback validation error:', error)
      return false
    }
  }

  parseCallbackData(body: any): PhonePeCallbackData | null {
    try {
      if (body.response) {
        const decodedResponse = JSON.parse(Buffer.from(body.response, 'base64').toString())
        return decodedResponse
      }
      return null
    } catch (error) {
      console.error('Error parsing callback data:', error)
      return null
    }
  }
}

export const phonePeService = new PhonePeService()