import { NextRequest, NextResponse } from 'next/server'
import { getSessionData } from '@/lib/auth'
import { saveAdminSettings, getAdminSettings } from '@/lib/admin-settings'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const sessionData = getSessionData(request)
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, settings } = body

    if (action === 'save') {
      try {
        // Validate settings before saving
        const requiredFields = ['phonepeMerchantId', 'phonepeSaltKey']

        for (const field of requiredFields) {
          if (settings[field] && settings[field].trim() === '') {
            return NextResponse.json(
              { error: `${field} cannot be empty if provided` },
              { status: 400 }
            )
          }
        }

        // Validate email format if provided
        if (settings.adminEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(settings.adminEmail)) {
            return NextResponse.json(
              { error: 'Invalid admin email format' },
              { status: 400 }
            )
          }
        }

        // Validate application fee
        if (settings.applicationFee) {
          const fee = parseFloat(settings.applicationFee)
          if (isNaN(fee) || fee < 0) {
            return NextResponse.json(
              { error: 'Application fee must be a valid positive number' },
              { status: 400 }
            )
          }
        }

        // Save settings to server-side storage
        const savedSettings = saveAdminSettings(settings)

        return NextResponse.json(
          {
            success: true,
            message: 'Settings saved successfully',
            settings: savedSettings
          },
          { status: 200 }
        )
      } catch (error) {
        console.error('Error saving settings:', error)
        return NextResponse.json(
          { error: 'Failed to save settings' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in admin API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const sessionData = getSessionData(request)
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return current settings from server-side storage
    const settings = getAdminSettings()
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}