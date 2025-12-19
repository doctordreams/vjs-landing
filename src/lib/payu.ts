import crypto from 'crypto'
import axios from 'axios'
import { getAdminSetting } from './admin-settings'

export interface PayUPaymentRequest {
  key: string
  salt: string
  txnid: string
  amount: string
  firstname: string
  email: string
  phone: string
  productinfo: string
  surl: string
  furl: string
  hash: string
}

export interface PayUPaymentResponse {
  success: boolean
  message?: string
  data?: {
    txnid: string
    amount: string
    status: string
    hash: string
    paymentUrl?: string
  }
}

export interface PayUCallbackData {
  mihpayid: string
  mode: string
  status: string
  unmappedstatus: string
  key: string
  txnid: string
  amount: string
  addedon: string
  productinfo: string
  firstname: string
  lastname: string
  address1: string
  address2: string
  city: string
  state: string
  country: string
  zipcode: string
  email: string
  phone: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  udf6?: string
  udf7?: string
  udf8?: string
  udf9?: string
  udf10?: string
  hash: string
  field1?: string
  field2?: string
  field3?: string
  field4?: string
  field5?: string
  field6?: string
  field7?: string
  field8?: string
  field9?: string
  error?: string
  error_Message?: string
  cardCategory?: string
  cardToken?: string
  bank_ref_num?: string
  bankcode?: string
  payment_mode?: string
  payuMoneyId?: string
  PG_TYPE?: string
  deleted?: string
}

class PayUService {
  private key: string
  private salt: string
  private baseUrl: string
  private surl: string
  private furl: string

  constructor() {
    // Load settings from environment variables or admin settings
    this.key = process.env.PAYU_KEY || this.getStoredSetting('payuKey') || ''
    this.salt = process.env.PAYU_SALT || this.getStoredSetting('payuSalt') || ''
    
    // PayU Base URL - Use production URL: https://secure.payu.in (or test: https://test.payu.in)
    this.baseUrl = process.env.PAYU_BASE_URL || this.getStoredSetting('payuBaseUrl') || 
      (process.env.NODE_ENV === 'production' ? 'https://secure.payu.in' : 'https://test.payu.in')
    
    // Success and Failure URLs - Must use absolute URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || this.getStoredSetting('siteUrl') || ''
    
    // Fallback for local testing if not set
    if (!baseUrl || baseUrl === 'null' || baseUrl === 'undefined') {
      baseUrl = 'http://localhost:3000'
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')
    
    this.surl = `${baseUrl}/api/payment/payu-callback`
    this.furl = `${baseUrl}/api/payment/payu-callback`
  }

  private getStoredSetting(key: string): string {
    return getAdminSetting(key as keyof import('./admin-settings').AdminSettings)
  }

  private generateHash(params: any): string {
    // PayU Hash Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    const hashString = [
      params.key,
      params.txnid,
      params.amount,
      params.productinfo,
      params.firstname,
      params.email,
      params.udf1 || '',
      params.udf2 || '',
      params.udf3 || '',
      params.udf4 || '',
      params.udf5 || '',
      params.udf6 || '',
      params.udf7 || '',
      params.udf8 || '',
      params.udf9 || '',
      params.udf10 || '',
      this.salt
    ].join('|')
    
    return crypto.createHash('sha512').update(hashString).digest('hex')
  }

  async initiatePayment(paymentRequest: Omit<PayUPaymentRequest, 'hash'>): Promise<PayUPaymentResponse> {
    try {
      // Use provided transaction ID
      const txnid = paymentRequest.txnid;

      // Prepare parameters in the order required for hash calculation
      const params = {
        key: this.key,
        txnid: txnid,
        amount: paymentRequest.amount,
        productinfo: paymentRequest.productinfo,
        firstname: paymentRequest.firstname,
        email: paymentRequest.email,
        phone: paymentRequest.phone,
        surl: this.surl,
        furl: this.furl,
        udf1: '', 
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: ''
      }

      // Generate hash
      const hash = this.generateHash(params)

      // Prepare request data with hash
      const requestData = {
        ...params,
        hash
      }

      console.log('--- PAYU SIGNING DEBUG ---')
      console.log('Generated Hash:', hash)
      console.log('Parameters:', JSON.stringify(requestData, null, 2))

      // Return the data for the frontend to submit via Form POST
      return {
        success: true,
        data: {
          status: 'pending',
          paymentUrl: `${this.baseUrl}/_payment`, 
          ...requestData
        } as any
      }
    } catch (error: any) {
      console.error('PayU signing error:', error)
      return {
        success: false,
        message: 'Failed to generate payment signature'
      }
    }
  }

  validateCallback(callbackData: any, receivedHash: string): boolean {
    try {
      // Extract parameters from callback data
      const params = {
        txnid: callbackData.txnid,
        amount: callbackData.amount,
        status: callbackData.status,
        productinfo: callbackData.productinfo,
        firstname: callbackData.firstname,
        email: callbackData.email,
        phone: callbackData.phone
      }

      // Generate expected hash
      const expectedHash = this.generateHash(params)
      
      // Compare hashes
      return expectedHash === receivedHash
    } catch (error) {
      console.error('PayU callback validation error:', error)
      return false
    }
  }

  parseCallbackData(body: any): PayUCallbackData | null {
    try {
      // PayU callback can be sent as POST data or query parameters
      if (body.txnid) {
        return body as PayUCallbackData
      }
      return null
    } catch (error) {
      console.error('Error parsing PayU callback data:', error)
      return null
    }
  }

  async checkPaymentStatus(txnid: string): Promise<PayUPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment/status`,
        {
          key: this.key,
          command: 'verify_payment',
          var1: txnid,
          salt: this.salt
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      if (response.data.status === 1) {
        return {
          success: true,
          data: {
            txnid: response.data.transaction_details.txnid,
            amount: response.data.transaction_details.amount,
            status: response.data.transaction_details.status,
            hash: response.data.transaction_details.hash
          }
        }
      } else {
        return {
          success: false,
          message: response.data.msg || 'Failed to check payment status'
        }
      }
    } catch (error) {
      console.error('PayU status check error:', error)
      return {
        success: false,
        message: 'Failed to check payment status'
      }
    }
  }
}

export const payUService = new PayUService()