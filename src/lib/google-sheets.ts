import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { getAdminSetting } from './admin-settings'

// Default Spreadsheet ID - can be overridden by admin settings
let SPREADSHEET_ID = '1Q5joAp1s78blerN0GnFaI-Y-w4wSfeAw0Gb6Bjz_NOw'

// Define the range for our data
const SHEET_NAME = 'Sheet1' // Default sheet name
const RANGE = `${SHEET_NAME}!A:Z` // Full range to accommodate all columns

export interface ScholarshipApplication {
  timestamp: string
  studentId: string
  transactionId: string
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED'
  amount: number
  studentName: string
  fatherName: string
  motherName: string
  studentMobile: string
  fatherMobile: string
  motherMobile: string
  email: string
  address: string
  pincode: string
  taluk: string
  district: string
  presentCollege: string
  tenthPercentage: string
  ddRepresentative: string
  countryPreference: string
  collegePreference: string
  budget: string
  facilities: string
}

class GoogleSheetsService {
  private sheets: any
  private auth: GoogleAuth

  constructor() {
    // Load settings from localStorage (client-side) or use defaults
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('admin_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        SPREADSHEET_ID = settings.googleSheetId || SPREADSHEET_ID
      }
    }

    // Initialize Google Auth with service account
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || this.getStoredSetting('googleServiceAccountEmail'),
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || this.getStoredSetting('googlePrivateKey')?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
  }

  private getStoredSetting(key: string): string {
    return getAdminSetting(key as keyof import('./admin-settings').AdminSettings)
  }

  async appendRow(data: ScholarshipApplication): Promise<void> {
    try {
      const values = [
        [
          data.timestamp,
          data.studentId,
          data.transactionId,
          data.paymentStatus,
          data.amount,
          data.studentName,
          data.fatherName,
          data.motherName,
          data.studentMobile,
          data.fatherMobile,
          data.motherMobile,
          data.email,
          data.address,
          data.pincode,
          data.taluk,
          data.district,
          data.presentCollege,
          data.tenthPercentage,
          data.ddRepresentative,
          data.countryPreference,
          data.collegePreference,
          data.budget,
          data.facilities
        ]
      ]

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      })

      console.log('Google Sheets response:', response.data)
    } catch (error) {
      console.error('Error appending to Google Sheets:', error)
      throw new Error('Failed to save data to Google Sheets')
    }
  }

  async updatePaymentStatus(transactionId: string, status: 'SUCCESS' | 'FAILED'): Promise<void> {
    try {
      // First, find the row with the matching transaction ID
      const getResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE
      })

      const rows = getResponse.data.values
      if (!rows || rows.length === 0) {
        throw new Error('No data found in spreadsheet')
      }

      // Find the row index (0-based) with matching transaction ID
      let rowIndex = -1
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][2] === transactionId) { // Transaction ID is at index 2
          rowIndex = i
          break
        }
      }

      if (rowIndex === -1) {
        throw new Error('Transaction ID not found')
      }

      // Update the payment status (column D, index 3)
      const updateRange = `${SHEET_NAME}!D${rowIndex + 1}` // +1 because sheets are 1-indexed
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[status]]
        }
      })

      console.log(`Updated payment status for transaction ${transactionId} to ${status}`)
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  async getTransaction(transactionId: string): Promise<ScholarshipApplication | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return null
      }

      // Find the row with matching transaction ID
      for (const row of rows) {
        if (row[2] === transactionId) { // Transaction ID is at index 2
          return {
            timestamp: row[0] || '',
            studentId: row[1] || '',
            transactionId: row[2] || '',
            paymentStatus: row[3] as 'PENDING' | 'SUCCESS' | 'FAILED',
            amount: parseFloat(row[4]) || 0,
            studentName: row[5] || '',
            fatherName: row[6] || '',
            motherName: row[7] || '',
            studentMobile: row[8] || '',
            fatherMobile: row[9] || '',
            motherMobile: row[10] || '',
            email: row[11] || '',
            address: row[12] || '',
            pincode: row[13] || '',
            taluk: row[14] || '',
            district: row[15] || '',
            presentCollege: row[16] || '',
            tenthPercentage: row[17] || '',
            ddRepresentative: row[18] || '',
            countryPreference: row[19] || '',
            collegePreference: row[20] || '',
            budget: row[21] || '',
            facilities: row[22] || ''
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error getting transaction:', error)
      throw new Error('Failed to retrieve transaction')
    }
  }

  generateStudentId(): string {
    return `VJ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }
}

export const googleSheetsService = new GoogleSheetsService()