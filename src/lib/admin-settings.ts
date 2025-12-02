import fs from 'fs'
import path from 'path'

export interface AdminSettings {
  paymentGateway: 'phonepe' | 'payu';
  googleServiceAccountEmail: string;
  googlePrivateKey: string;
  googleSheetId: string;
  phonepeMerchantId: string;
  phonepeSaltKey: string;
  phonepeSaltIndex: string;
  phonepeBaseUrl: string;
  payuKey: string;
  payuSalt: string;
  payuBaseUrl: string;
  payuMerchantId: string;
  applicationFee: string;
  applicationCurrency: string;
  applicationName: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  siteUrl: string;
  adminEmail: string;
  supportPhone: string;
  supportEmail: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'admin-settings.json')

// In-memory cache
let settingsCache: AdminSettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Default settings
const defaultSettings: AdminSettings = {
  paymentGateway: 'phonepe',
  googleServiceAccountEmail: '',
  googlePrivateKey: '',
  googleSheetId: '',
  phonepeMerchantId: '',
  phonepeSaltKey: '',
  phonepeSaltIndex: '1',
  phonepeBaseUrl: 'https://api.phonepe.com',
  payuKey: '',
  payuSalt: '',
  payuBaseUrl: 'https://test.payu.in',
  payuMerchantId: '',
  applicationFee: '250',
  applicationCurrency: 'INR',
  applicationName: 'Vaidya Jyothi Scholarship',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  smtpFromEmail: '',
  smtpFromName: 'Vaidya Jyothi Scholarship',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  adminEmail: '',
  supportPhone: '',
  supportEmail: ''
}

// Load settings from file (only works in non-serverless environments)
function loadSettingsFromFile(): AdminSettings {
  try {
    // In serverless environments, file system might not be accessible
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // Return defaults merged with environment variables
      return { ...defaultSettings }
    }

    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      const parsed = JSON.parse(data)

      // Merge with defaults to ensure all fields exist
      return { ...defaultSettings, ...parsed }
    }
  } catch (error) {
    console.warn('Could not load settings from file (serverless environment?). Using defaults.')
  }

  return { ...defaultSettings }
}

// Save settings to file (only works in non-serverless environments)
function saveSettingsToFile(settings: AdminSettings): void {
  try {
    // Check if we're in a serverless environment (Vercel, etc.)
    // In serverless, file system is read-only, so we skip file writing
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.warn('⚠️ File system is read-only in serverless environment. Settings will be stored in memory only.')
      // Store in memory cache only
      settingsCache = { ...settings }
      cacheTimestamp = Date.now()
      return
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(SETTINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    // If file write fails (e.g., in serverless), just use memory cache
    console.warn('⚠️ Could not save settings to file (serverless environment?). Using memory cache only.')
    settingsCache = { ...settings }
    cacheTimestamp = Date.now()
  }
}

// Get admin settings (with caching)
export function getAdminSettings(): AdminSettings {
  const now = Date.now()

  // Return cached settings if they're still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return { ...settingsCache }
  }

  // Load from file
  settingsCache = loadSettingsFromFile()
  cacheTimestamp = now

  return { ...settingsCache }
}

// Save admin settings
export function saveAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  // Get current settings
  const currentSettings = getAdminSettings()

  // Merge with new settings
  const updatedSettings = { ...currentSettings, ...settings }

  // Save to file
  saveSettingsToFile(updatedSettings)

  // Update cache
  settingsCache = { ...updatedSettings }
  cacheTimestamp = Date.now()

  return { ...updatedSettings }
}

// Get a specific setting value
export function getAdminSetting(key: keyof AdminSettings): string {
  const settings = getAdminSettings()
  return settings[key] || ''
}

// Clear cache (useful for testing or forced reload)
export function clearSettingsCache(): void {
  settingsCache = null
  cacheTimestamp = 0
}



