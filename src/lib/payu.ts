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
  mihpayid?: string
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
    
    // Success and Failure URLs - Must use production URL in production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || this.getStoredSetting('siteUrl') || ''
    if (!baseUrl) {
      console.warn('⚠️ NEXT_PUBLIC_APP_URL or siteUrl not set! Payment redirects may fail.')
    }
    this.surl = baseUrl ? `${baseUrl}/payment/success` : '/payment/success'
    this.furl = baseUrl ? `${baseUrl}/payment/failure` : '/payment/failure'
  }

  private getStoredSetting(key: string): string {
    return getAdminSetting(key as keyof import('./admin-settings').AdminSettings)
  }

  private generateHash(params: Record<string, string>): string {
    // Sort the parameters alphabetically
    const sortedKeys = Object.keys(params).sort()
    const hashString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    // Append salt and generate hash
    const hashStringWithSalt = hashString + this.salt
    return crypto.createHash('sha512').update(hashStringWithSalt).digest('hex')
  }

  async initiatePayment(paymentRequest: Omit<PayUPaymentRequest, 'hash'>): Promise<PayUPaymentResponse> {
    try {
      // Generate transaction ID
      const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Prepare parameters
      const params = {
        key: this.key,
        txnid: txnid,
        amount: paymentRequest.amount,
        firstname: paymentRequest.firstname,
        email: paymentRequest.email,
        phone: paymentRequest.phone,
        productinfo: paymentRequest.productinfo,
        surl: this.surl,
        furl: this.furl
      }

      // Generate hash
      const hash = this.generateHash(params)

      // Prepare request data
      const requestData = {
        ...params,
        hash
      }

      const response = await axios.post(
        `${this.baseUrl}/payment`,
        requestData,
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
            txnid,
            amount: paymentRequest.amount,
            status: 'pending',
            hash,
            paymentUrl: response.data.payment_url || response.data.surl
          }
        }
      } else {
        return {
          success: false,
          message: response.data.msg || 'Failed to initiate payment'
        }
      }
    } catch (error) {
      console.error('PayU payment initiation error:', error)
      return {
        success: false,
        message: 'Failed to initiate payment'
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