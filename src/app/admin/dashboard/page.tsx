'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Shield, Save, Eye, EyeOff, LogOut, CheckCircle, AlertTriangle, RefreshCw, Palette, CreditCard, Database, Key, Settings, Wallet, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface AdminSettings {
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

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [settings, setSettings] = useState<AdminSettings>({
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
    payuBaseUrl: process.env.NODE_ENV === 'production' ? 'https://secure.payu.in' : 'https://test.payu.in',
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
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
    adminEmail: '',
    supportPhone: '',
    supportEmail: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({
    phonepeMerchantId: false,
    phonepeSaltKey: false,
    payuKey: false,
    payuSalt: false,
    googlePrivateKey: false,
    smtpPassword: false
  })
  const [applications, setApplications] = useState<any[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(false)

  const loadApplications = async () => {
    setIsLoadingApplications(true)
    try {
      const response = await fetch('/api/admin/applications')
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoadingApplications(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  useEffect(() => {
    // Middleware handles authentication, so we can assume user is authenticated
    // Load settings from localStorage (will be changed to server-side storage later)
    loadSettings()
    loadApplications()
    setIsAuthenticated(true)
  }, [])

  const saveSettings = async () => {
    setIsLoading(true)
    setSaveStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          settings
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSaveStatus({ type: 'success', message: 'Settings saved successfully!' })
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Failed to save settings' })
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' })
      }, 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Redirect to login page regardless of API response
    router.push('/admin')
  }

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Vaidya Jyothi Scholarship Management</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Gateway Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Payment Gateway</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current:</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md">
              {settings.paymentGateway === 'phonepe' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">PhonePe</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span className="font-medium">PayU</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('paymentGateway', settings.paymentGateway === 'phonepe' ? 'payu' : 'phonepe')}
            >
              Switch to {settings.paymentGateway === 'phonepe' ? 'PayU' : 'PhonePe'}
            </Button>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Theme</h2>
          <ThemeSwitcher />
        </div>

        {saveStatus.type && (
          <Alert className={`mb-6 ${saveStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {saveStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="phonepe" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              PhonePe
            </TabsTrigger>
            <TabsTrigger value="payu" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              PayU
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Google Sheets
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Scholarship Applications
                  </CardTitle>
                  <CardDescription>
                    Review and manage all submitted scholarship applications
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                   {settings.googleSheetId && (
                    <a 
                      href={`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        View on Spreadsheet
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm" onClick={loadApplications} disabled={isLoadingApplications}>
                    <RefreshCw className={`w-4 h-4 ${isLoadingApplications ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold">Student Name</TableHead>
                        <TableHead className="font-bold">Contact</TableHead>
                        <TableHead className="font-bold">Email</TableHead>
                        <TableHead className="font-bold text-center">Status</TableHead>
                        <TableHead className="font-bold text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingApplications ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                          </TableCell>
                        </TableRow>
                      ) : applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No applications found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.studentName}</TableCell>
                            <TableCell>{app.studentMobile}</TableCell>
                            <TableCell>{app.email}</TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={app.paymentStatus === 'SUCCESS' ? 'default' : 'destructive'}
                                className={app.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              >
                                {app.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-gray-500 text-xs">
                              {app.timestamp ? new Date(app.timestamp).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PhonePe Settings */}
          <TabsContent value="phonepe">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  PhonePe Payment Gateway Settings
                </CardTitle>
                <CardDescription>
                  Configure your PhonePe merchant account details for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phonepeMerchantId">Merchant ID *</Label>
                    <Input
                      id="phonepeMerchantId"
                      value={settings.phonepeMerchantId}
                      onChange={(e) => handleInputChange('phonepeMerchantId', e.target.value)}
                      placeholder="Enter PhonePe Merchant ID"
                      type={showApiKeys.phonepeMerchantId ? 'text' : 'password'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phonepeSaltKey">Salt Key *</Label>
                    <div className="relative">
                      <Input
                        id="phonepeSaltKey"
                        value={settings.phonepeSaltKey}
                        onChange={(e) => handleInputChange('phonepeSaltKey', e.target.value)}
                        placeholder="Enter PhonePe Salt Key"
                        type={showApiKeys.phonepeSaltKey ? 'text' : 'password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility('phonepeSaltKey')}
                      >
                        {showApiKeys.phonepeSaltKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phonepeSaltIndex">Salt Index</Label>
                    <Input
                      id="phonepeSaltIndex"
                      value={settings.phonepeSaltIndex}
                      onChange={(e) => handleInputChange('phonepeSaltIndex', e.target.value)}
                      placeholder="Salt Index (usually 1)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phonepeBaseUrl">Base URL</Label>
                    <Input
                      id="phonepeBaseUrl"
                      value={settings.phonepeBaseUrl}
                      onChange={(e) => handleInputChange('phonepeBaseUrl', e.target.value)}
                      placeholder="PhonePe API Base URL"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to get these credentials from your PhonePe merchant dashboard. 
                    The Salt Key is highly sensitive and should be kept secure.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PayU Settings */}
          <TabsContent value="payu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  PayU Payment Gateway Settings
                </CardTitle>
                <CardDescription>
                  Configure your PayU merchant account details for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="payuKey">Merchant Key *</Label>
                    <div className="relative">
                      <Input
                        id="payuKey"
                        value={settings.payuKey}
                        onChange={(e) => handleInputChange('payuKey', e.target.value)}
                        placeholder="Enter PayU Merchant Key"
                        type={showApiKeys.payuKey ? 'text' : 'password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility('payuKey')}
                      >
                        {showApiKeys.payuKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payuSalt">Salt Key *</Label>
                    <div className="relative">
                      <Input
                        id="payuSalt"
                        value={settings.payuSalt}
                        onChange={(e) => handleInputChange('payuSalt', e.target.value)}
                        placeholder="Enter PayU Salt Key"
                        type={showApiKeys.payuSalt ? 'text' : 'password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility('payuSalt')}
                      >
                        {showApiKeys.payuSalt ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payuBaseUrl">Base URL</Label>
                    <Input
                      id="payuBaseUrl"
                      value={settings.payuBaseUrl}
                      onChange={(e) => handleInputChange('payuBaseUrl', e.target.value)}
                      placeholder="PayU API Base URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payuMerchantId">Merchant ID (Optional)</Label>
                    <Input
                      id="payuMerchantId"
                      value={settings.payuMerchantId}
                      onChange={(e) => handleInputChange('payuMerchantId', e.target.value)}
                      placeholder="Enter PayU Merchant ID"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to get these credentials from your PayU merchant dashboard. 
                    The Salt Key is highly sensitive and should be kept secure.
                    PayU supports multiple payment methods including UPI, cards, and net banking.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Google Sheets Settings */}
          <TabsContent value="google">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Google Sheets Integration
                </CardTitle>
                <CardDescription>
                  Configure Google Sheets API for storing scholarship applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="googleSheetId">Google Sheet ID *</Label>
                    <Input
                      id="googleSheetId"
                      value={settings.googleSheetId}
                      onChange={(e) => handleInputChange('googleSheetId', e.target.value)}
                      placeholder="Enter Google Sheet ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="googleServiceAccountEmail">Service Account Email *</Label>
                    <Input
                      id="googleServiceAccountEmail"
                      value={settings.googleServiceAccountEmail}
                      onChange={(e) => handleInputChange('googleServiceAccountEmail', e.target.value)}
                      placeholder="your-service-account@project.iam.gserviceaccount.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="googlePrivateKey">Private Key *</Label>
                    <div className="relative">
                      <Textarea
                        id="googlePrivateKey"
                        value={settings.googlePrivateKey}
                        onChange={(e) => handleInputChange('googlePrivateKey', e.target.value)}
                        placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => toggleApiKeyVisibility('googlePrivateKey')}
                      >
                        {showApiKeys.googlePrivateKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Remember to share your Google Sheet with the service account email and give it editor access.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings for sending emails to applicants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.smtpPort}
                      onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.smtpUser}
                      onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        value={settings.smtpPassword}
                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                        placeholder="Enter SMTP password"
                        type={showApiKeys.smtpPassword ? 'text' : 'password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleApiKeyVisibility('smtpPassword')}
                      >
                        {showApiKeys.smtpPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpFromEmail">From Email</Label>
                    <Input
                      id="smtpFromEmail"
                      value={settings.smtpFromEmail}
                      onChange={(e) => handleInputChange('smtpFromEmail', e.target.value)}
                      placeholder="noreply@vaidyajyothi.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpFromName">From Name</Label>
                    <Input
                      id="smtpFromName"
                      value={settings.smtpFromName}
                      onChange={(e) => handleInputChange('smtpFromName', e.target.value)}
                      placeholder="Vaidya Jyothi Scholarship"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure general application settings and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicationFee">Application Fee (₹)</Label>
                    <Input
                      id="applicationFee"
                      value={settings.applicationFee}
                      onChange={(e) => handleInputChange('applicationFee', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicationName">Application Name</Label>
                    <Input
                      id="applicationName"
                      value={settings.applicationName}
                      onChange={(e) => handleInputChange('applicationName', e.target.value)}
                      placeholder="Vaidya Jyothi Scholarship"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                      placeholder="https://your-domain.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      value={settings.adminEmail}
                      onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                      placeholder="admin@vaidyajyothi.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      placeholder="support@vaidyajyothi.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      placeholder="+91-9035061122"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={loadSettings} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={isLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}