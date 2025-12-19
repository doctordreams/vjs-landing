import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { googleSheetsService } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch from Prisma
    let prismaApplications: any[] = []
    try {
      prismaApplications = await db.scholarshipApplication.findMany({
        orderBy: { timestamp: 'desc' }
      })
    } catch (err) {
      console.warn('Failed to fetch from Prisma:', err)
    }

    // 2. Fetch from Google Sheets
    let sheetsApplications: any[] = []
    try {
      sheetsApplications = await googleSheetsService.getAllTransactions()
    } catch (err) {
      console.warn('Failed to fetch from Google Sheets:', err)
    }

    // 3. Merge and deduplicate by transactionId
    const mergedMap = new Map()
    
    // Process sheets first (older data source)
    sheetsApplications.forEach(app => {
      if (app.transactionId) mergedMap.set(app.transactionId, app)
    })
    
    // Process prisma (newer, potentially more up-to-date status)
    prismaApplications.forEach(app => {
      if (app.transactionId) mergedMap.set(app.transactionId, {
        ...app,
        // Ensure amount is a number if it came from DB as something else
        amount: Number(app.amount) 
      })
    })

    const applications = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    console.log(`[Admin API] Returning ${applications.length} total applications (${prismaApplications.length} DB, ${sheetsApplications.length} Sheets)`)

    return NextResponse.json({
      success: true,
      applications
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
