'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Loader2, GraduationCap, Phone, Mail, MapPin, Building, User, Globe, Home, FileText, HelpCircle, Menu, X, CreditCard, Shield, CheckCircle } from 'lucide-react'

export default function ScholarshipForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    studentMobile: '',
    fatherMobile: '',
    motherMobile: '',
    email: '',
    address: '',
    pincode: '',
    taluk: '',
    district: '',
    presentCollege: '',
    tenthPercentage: '',
    ddRepresentative: '',
    countryPreference: ['RUSSIA'], // Multi-select with Russia as default
    comments: '' // Combined field for all preferences
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    const requiredFields = [
      'studentName',
      'fatherName', 
      'motherName',
      'studentMobile',
      'fatherMobile',
      'email',
      'address',
      'pincode',
      'taluk',
      'district',
      'presentCollege',
      'tenthPercentage',
      'ddRepresentative',
      'countryPreference'
    ]

    requiredFields.forEach(field => {
      if (field === 'countryPreference') {
        // Special handling for array field
        if (!formData.countryPreference || formData.countryPreference.length === 0) {
          newErrors[field] = 'At least one country must be selected'
          isValid = false
        }
      } else if (!formData[field as keyof typeof formData] || (formData[field as keyof typeof formData] as string).trim() === '') {
        newErrors[field] = 'This field is required'
        isValid = false
      }
    })

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Mobile validation
    if (formData.studentMobile && !/^[0-9]{10}$/.test(formData.studentMobile)) {
      newErrors.studentMobile = 'Mobile number must be 10 digits'
      isValid = false
    }

    // Pincode validation
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits'
      isValid = false
    }

    // 10th percentage validation
    if (formData.tenthPercentage) {
      const percentage = parseFloat(formData.tenthPercentage)
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        newErrors.tenthPercentage = 'Percentage must be between 0 and 100'
        isValid = false
      }
    }

    setErrors(newErrors)

    if (!isValid) {
      toast({
        title: "Form Error",
        description: "Please check the errors highlighted in red.",
        variant: "destructive",
      })
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setShowPaymentModal(true)
  }

  const initiatePayment = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl && data.payuParams) {
        if (data.sheetsSaved) {
            toast({
              title: "Application Saved",
              description: "Your details have been securely saved to our records.",
              className: "bg-green-50 border-green-200 text-green-800",
            })
        } else {
             toast({
              title: "Notice",
              description: "Application saved locally, but there was an issue syncing to Sheets. Proceeding with payment.",
              variant: "default",
            })
        }

        // Dynamically create a form and submit it to PayU
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.paymentUrl // https://secure.payu.in/_payment

        // Add all parameters as hidden inputs
        Object.entries(data.payuParams).forEach(([key, value]) => {
          if (key !== 'paymentUrl' && value !== undefined && value !== null) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = String(value)
            form.appendChild(input)
          }
        })

        document.body.appendChild(form)
        form.submit()
        
        // Show loading state while redirecting
        // window.location.href = data.paymentUrl // No longer needed as form.submit handles it
      } else {
        toast({
          title: "Payment Error",
          description: data.error || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        setShowPaymentModal(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setShowPaymentModal(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
    setIsMenuOpen(false)
  }



  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-50 md:hidden">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => scrollToSection('hero')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            activeSection === 'hero' 
              ? 'text-slate-900 bg-slate-100 scale-105' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        <button
          onClick={() => scrollToSection('personal')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            activeSection === 'personal' 
              ? 'text-slate-900 bg-slate-100 scale-105' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Personal</span>
        </button>
        <button
          onClick={() => scrollToSection('contact')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            activeSection === 'contact' 
              ? 'text-slate-900 bg-slate-100 scale-105' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Contact</span>
        </button>
        <button
          onClick={() => scrollToSection('academic')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            activeSection === 'academic' 
              ? 'text-slate-900 bg-slate-100 scale-105' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Academic</span>
        </button>
        <button
          onClick={() => scrollToSection('preferences')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            activeSection === 'preferences' 
              ? 'text-slate-900 bg-slate-100 scale-105' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">MBBS</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-16 md:pb-0">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white shadow-lg border-slate-200 hover:bg-slate-50"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Mobile Side Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Doctor Dreams</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                <button onClick={() => scrollToSection('hero')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">Home</button>
                <button onClick={() => scrollToSection('personal')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">Personal Info</button>
                <button onClick={() => scrollToSection('contact')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">Contact Info</button>
                <button onClick={() => scrollToSection('address')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">Address</button>
                <button onClick={() => scrollToSection('academic')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">Academic</button>
                <button onClick={() => scrollToSection('preferences')} className="w-full text-left p-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">MBBS Preferences</button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div id="hero" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-4 md:py-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Doctor Dreams Branding */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl">
              <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>
          
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm md:text-base font-medium text-blue-100 border border-white/20 mb-4">
              Doctor Dreams
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 px-2 leading-tight">
            Achieve Your MBBS Dreams with<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Vaidya Jyothi Scholarship
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto px-4 mb-8 leading-relaxed">
            India's leading MBBS consultancy guiding you to medical education excellence. 
            Apply now and take the first step towards your dream career.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 text-sm md:text-base">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="text-slate-200">6000+ Success Stories</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-slate-200">Trusted Since 2009</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              <span className="text-slate-200">25+ Destinations</span>
            </div>
          </div>
          
          {/* Payment Info Banner */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-5 md:p-6 max-w-lg mx-auto border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 text-slate-200">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                <span className="font-semibold">Application Fee: <span className="text-white text-lg">₹250</span></span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 text-slate-200">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                <span>Secure Payment Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto p-3 md:p-4 py-6 md:py-10">
        <Card className="shadow-2xl border-slate-200/80 bg-white">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50/50 px-4 md:px-8 py-6 md:py-8 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div className="bg-slate-900 rounded-lg p-2.5 md:p-3">
                <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-3xl font-bold text-slate-900 mb-2">
                  <span className="hidden sm:inline">Vaidya Jyothi Scholarship Application</span>
                  <span className="sm:hidden">Scholarship Application</span>
            </CardTitle>
                <CardDescription className="text-sm md:text-base text-slate-600">
                  Complete the form below to apply for the Vaidya Jyothi Scholarship. All fields marked with * are required.
            </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Personal Information Section */}
              <div id="personal" className="space-y-4 md:space-y-5 scroll-mt-20">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Personal Information
                </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName" className="text-sm font-semibold text-slate-700">Student Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`text-sm md:text-base bg-white ${errors.studentName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'}`}
                    />
                    {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="fatherName" className="text-sm">Father Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      placeholder="Enter father's name"
                      className={`text-sm md:text-base ${errors.fatherName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="motherName" className="text-sm">Mother Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="motherName"
                      value={formData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      placeholder="Enter mother's name"
                      className={`text-sm md:text-base ${errors.motherName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information Section */}
              <div id="contact" className="space-y-4 md:space-y-5 scroll-mt-20">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <Phone className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Contact Information
                </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="studentMobile" className="text-sm">Student Mobile <span className="text-red-500">*</span></Label>
                    <Input
                      id="studentMobile"
                      type="tel"
                      value={formData.studentMobile}
                      onChange={(e) => handleInputChange('studentMobile', e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className={`text-sm md:text-base ${errors.studentMobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.studentMobile && <p className="text-red-500 text-xs mt-1">{errors.studentMobile}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="fatherMobile" className="text-sm">Father Mobile <span className="text-red-500">*</span></Label>
                    <Input
                      id="fatherMobile"
                      type="tel"
                      value={formData.fatherMobile}
                      onChange={(e) => handleInputChange('fatherMobile', e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className={`text-sm md:text-base ${errors.fatherMobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.fatherMobile && <p className="text-red-500 text-xs mt-1">{errors.fatherMobile}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="motherMobile" className="text-sm">Mother Mobile</Label>
                    <Input
                      id="motherMobile"
                      type="tel"
                      value={formData.motherMobile}
                      onChange={(e) => handleInputChange('motherMobile', e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 md:w-4 md:h-4" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className={`text-sm md:text-base ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <Separator />

              {/* Address Information Section */}
              <div id="address" className="space-y-4 md:space-y-5 scroll-mt-20">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <MapPin className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Address Information
                </h3>
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="address" className="text-sm">Address <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address"
                    rows={2}
                    className={`text-sm md:text-base resize-none ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="pincode" className="text-sm">Pincode <span className="text-red-500">*</span></Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="6-digit"
                      maxLength={6}
                      className={`text-sm md:text-base ${errors.pincode ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="taluk" className="text-sm">Taluk <span className="text-red-500">*</span></Label>
                    <Input
                      id="taluk"
                      value={formData.taluk}
                      onChange={(e) => handleInputChange('taluk', e.target.value)}
                      placeholder="Enter taluk"
                      className={`text-sm md:text-base ${errors.taluk ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.taluk && <p className="text-red-500 text-xs mt-1">{errors.taluk}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2 sm:col-span-2 lg:col-span-2">
                    <Label htmlFor="district" className="text-sm">District <span className="text-red-500">*</span></Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Enter district"
                      className={`text-sm md:text-base ${errors.district ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Academic Information Section */}
              <div id="academic" className="space-y-4 md:space-y-5 scroll-mt-20">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <Building className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Academic Information
                </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="presentCollege" className="text-sm">Present College <span className="text-red-500">*</span></Label>
                    <Input
                      id="presentCollege"
                      value={formData.presentCollege}
                      onChange={(e) => handleInputChange('presentCollege', e.target.value)}
                      placeholder="Current college name"
                      className={`text-sm md:text-base ${errors.presentCollege ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.presentCollege && <p className="text-red-500 text-xs mt-1">{errors.presentCollege}</p>}
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="tenthPercentage" className="text-sm">10th Percentage <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenthPercentage"
                      type="number"
                      value={formData.tenthPercentage}
                      onChange={(e) => handleInputChange('tenthPercentage', e.target.value)}
                      placeholder="Enter percentage"
                      min="0"
                      max="100"
                      step="0.1"
                      className={`text-sm md:text-base ${errors.tenthPercentage ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.tenthPercentage && <p className="text-red-500 text-xs mt-1">{errors.tenthPercentage}</p>}
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="ddRepresentative" className="text-sm">DD Representative <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.ddRepresentative} 
                    onValueChange={(value) => handleInputChange('ddRepresentative', value)}
                  >
                    <SelectTrigger className={`text-sm md:text-base ${errors.ddRepresentative ? 'border-red-500 ring-red-500' : ''}`}>
                      <SelectValue placeholder="Select DD Representative" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIRMALA">NIRMALA</SelectItem>
                      <SelectItem value="SHALINI">SHALINI</SelectItem>
                      <SelectItem value="PAVITHRA">PAVITHRA</SelectItem>
                      <SelectItem value="JAFAR">JAFAR</SelectItem>
                      <SelectItem value="IMRAN">IMRAN</SelectItem>
                      <SelectItem value="RASHMI">RASHMI</SelectItem>
                      <SelectItem value="PALLAVI">PALLAVI</SelectItem>
                      <SelectItem value="SRIKANTH">SRIKANTH</SelectItem>
                      <SelectItem value="MARIYA">MARIYA</SelectItem>
                      <SelectItem value="CHANKESHAV">CHANKESHAV</SelectItem>
                      <SelectItem value="VAJEEHA">VAJEEHA</SelectItem>
                      <SelectItem value="JYOTHI">JYOTHI</SelectItem>
                      <SelectItem value="AISHWARYA">AISHWARYA</SelectItem>
                      <SelectItem value="RANI">RANI</SelectItem>
                      <SelectItem value="BHAVYA">BHAVYA</SelectItem>
                      <SelectItem value="RAGHU">RAGHU</SelectItem>
                      <SelectItem value="SUHEB">SUHEB</SelectItem>
                      <SelectItem value="MAHADEVNAYAK">MAHADEVNAYAK</SelectItem>
                      <SelectItem value="HARISH">HARISH</SelectItem>
                      <SelectItem value="MASHEK PATEL">MASHEK PATEL</SelectItem>
                      <SelectItem value="MAHBOOB BASHA">MAHBOOB BASHA</SelectItem>
                      <SelectItem value="DHARMENDRA">DHARMENDRA</SelectItem>
                      <SelectItem value="TAUSIF AHMED">TAUSIF AHMED</SelectItem>
                    </SelectContent>
                  </Select>
                   {errors.ddRepresentative && <p className="text-red-500 text-xs mt-1">{errors.ddRepresentative}</p>}
                </div>
              </div>

              <Separator />

              {/* MBBS Preferences Section */}
              <div id="preferences" className="space-y-4 md:space-y-5 scroll-mt-20">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <Globe className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  MBBS Preferences
                </h3>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {/* Country Preference - Multi-select */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Country Preference <span className="text-red-500">*</span></Label>
                    <p className="text-xs text-slate-500">Select one or more countries</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['RUSSIA', 'GEORGIA', 'UZBEKISTAN', 'KAZAKHSTAN', 'PHILIPPINES', 'EGYPT', 'KYRGYZSTAN', 'OTHERS'].map((country) => (
                        <label key={country} className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={formData.countryPreference.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('countryPreference', [...formData.countryPreference, country])
                              } else {
                                handleInputChange('countryPreference', formData.countryPreference.filter(c => c !== country))
                              }
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                          <span className="text-sm">{country}</span>
                        </label>
                      ))}
                    </div>
                    {errors.countryPreference && <p className="text-red-500 text-xs mt-1">{errors.countryPreference}</p>}
                  </div>
                  
                  {/* Combined Details Field */}
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="comments" className="text-sm">Additional Details (Optional)</Label>
                    <p className="text-xs text-slate-500">Enter college preference, budget, facilities, or any other details</p>
                    <Textarea 
                      id="comments"
                      value={formData.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      placeholder="E.g., Preferred college, budget range, hostel requirements, etc."
                      rows={4}
                      className="w-full text-sm md:text-base resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 md:pt-8 border-t border-slate-200">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-4 md:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Ready to start your MBBS journey?</p>
                      <p className="text-lg font-bold text-slate-900">Application Fee: ₹250</p>
                    </div>
                <Button 
                  type="submit" 
                      className="w-full sm:w-auto px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white transition-all duration-300 shadow-xl hover:shadow-2xl rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                          <CreditCard className="mr-2 h-5 w-5" />
                      Apply Now - Pay ₹250
                    </>
                  )}
                </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions Card for Mobile */}
        {isMobile && (
          <Card className="mt-6 shadow-xl border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-900 text-base mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={() => scrollToSection('personal')} className="text-xs border-slate-200 hover:bg-slate-100 hover:border-slate-300">
                  <User className="w-3 h-3 mr-1" />
                  Personal
                </Button>
                <Button variant="outline" size="sm" onClick={() => scrollToSection('contact')} className="text-xs border-slate-200 hover:bg-slate-100 hover:border-slate-300">
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" onClick={() => scrollToSection('academic')} className="text-xs border-slate-200 hover:bg-slate-100 hover:border-slate-300">
                  <Building className="w-3 h-3 mr-1" />
                  Academic
                </Button>
                <Button variant="outline" size="sm" onClick={() => scrollToSection('preferences')} className="text-xs border-slate-200 hover:bg-slate-100 hover:border-slate-300">
                  <Globe className="w-3 h-3 mr-1" />
                  MBBS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="bg-slate-900 rounded-lg p-2">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Confirm Payment</span>
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                You're about to pay the scholarship application fee
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-5 rounded-xl border border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Application Fee:</span>
                    <span className="font-bold text-xl text-slate-900">₹250</span>
                </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Student Name:</span>
                    <span className="font-semibold text-slate-900">{formData.studentName}</span>
                </div>
                  <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Email:</span>
                    <span className="font-medium text-sm text-slate-900 break-all">{formData.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 text-green-800">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm">Secure payment powered by PayU</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={initiatePayment}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                   {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Pay ₹250</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation - Only show on mobile */}
      <BottomNav />

      {/* Floating Help Button */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button
          size="sm"
          className="rounded-full w-14 h-14 shadow-xl bg-slate-900 hover:bg-slate-800 text-white border-2 border-white"
          onClick={() => setIsMenuOpen(true)}
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Compliance Footer Section */}
      <footer className="bg-slate-900 text-white mt-12 md:mt-16 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Doctor Dreams</h3>
              <p className="text-slate-300 text-sm mb-4">
                India's leading MBBS consultancy, guiding students to medical education excellence since 2009.
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Website: <a href="https://www.doctordreams.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">doctordreams.in</a></p>
                <p>Email: <a href="mailto:admissions@doctordreams.in" className="text-blue-400 hover:text-blue-300 underline">admissions@doctordreams.in</a></p>
                <p>Phone: <a href="tel:9035061122" className="text-blue-400 hover:text-blue-300">+91-9035061122</a></p>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Legal & Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.doctordreams.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://www.doctordreams.in/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href="https://www.doctordreams.in/refund-policy" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a href="https://www.doctordreams.in/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Advertising Compliance */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Advertising Compliance</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold mb-1 text-white">Google Ads Compliance</p>
                  <p className="text-xs text-slate-400">
                    This website uses Google Ads. By using this site, you consent to Google's use of cookies and data collection as per their 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-1">
                      Privacy Policy
                    </a>.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-white">Facebook Ads Compliance</p>
                  <p className="text-xs text-slate-400">
                    This website uses Facebook Pixel for advertising. Data is collected and used as per Facebook's 
                    <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-1">
                      Data Policy
                    </a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Collection Disclosure */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Data Collection</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p className="text-xs text-slate-400">
                  We collect personal information including name, email, phone number, and academic details for scholarship application processing. 
                  This data may be used for:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-2">
                  <li>Processing your scholarship application</li>
                  <li>Communication regarding your application</li>
                  <li>Marketing communications (with consent)</li>
                  <li>Analytics and website improvement</li>
                </ul>
                <p className="text-xs text-slate-400 mt-3">
                  You have the right to access, modify, or delete your personal data. Contact us at 
                  <a href="mailto:admissions@doctordreams.in" className="text-blue-400 hover:text-blue-300 underline ml-1">
                    admissions@doctordreams.in
                  </a> for data requests.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Disclaimers */}
          <div className="border-t border-slate-700 pt-6 mt-6">
            <div className="space-y-4">
              {/* Google Ads Disclaimer */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-sm mb-2 text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Google Ads & Analytics Disclosure
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This website uses Google Ads and Google Analytics to deliver personalized advertisements and analyze website traffic. 
                  Google uses cookies and similar technologies to collect and store information about your interactions with this website. 
                  You can opt-out of personalized advertising by visiting 
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Google Ads Settings
                  </a>
                  or by using the 
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Google Analytics Opt-out Browser Add-on
                  </a>.
                  For more information, please review Google's 
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Privacy Policy
                  </a> and 
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Advertising Policies
                  </a>.
                </p>
              </div>

              {/* Facebook Ads Disclaimer */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-sm mb-2 text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Facebook Ads & Pixel Disclosure
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This website uses Facebook Pixel, a web analytics and advertising service provided by Meta Platforms, Inc. 
                  Facebook Pixel collects information about your visit to this website, including pages viewed, actions taken, 
                  and may use cookies to track your browsing behavior across websites. This information is used to:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-300 mt-2 ml-4 space-y-1">
                  <li>Measure the effectiveness of our advertising campaigns</li>
                  <li>Deliver personalized advertisements on Facebook and Instagram</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Create custom audiences for remarketing</li>
                </ul>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  You can control Facebook's use of your data by visiting 
                  <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Facebook Ad Preferences
                  </a>
                  or adjusting your 
                  <a href="https://www.facebook.com/settings?tab=privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Privacy Settings
                  </a>.
                  For more information, please review Facebook's 
                  <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    Data Policy
                  </a>.
                </p>
              </div>

              {/* General Data Protection */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-sm mb-2 text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your Privacy Rights
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You have the right to access, correct, delete, or restrict the processing of your personal data. 
                  You may also object to processing or request data portability. To exercise these rights, contact us at 
                  <a href="mailto:admissions@doctordreams.in" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    admissions@doctordreams.in
                  </a>
                  or call 
                  <a href="tel:9035061122" className="text-blue-400 hover:text-blue-300 underline mx-1">
                    +91-9035061122
                  </a>.
                  We will respond to your request within 30 days.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright & Additional Links */}
          <div className="border-t border-slate-700 pt-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <div className="text-center md:text-left">
                <p>© {new Date().getFullYear()} Doctor Dreams. All rights reserved.</p>
                <p className="text-xs mt-1">Subdomain: vjs.doctordreams.in | Main Site: 
                  <a href="https://www.doctordreams.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-1">
                    doctordreams.in
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs">
                <a href="https://www.doctordreams.in/sitemap" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Sitemap
                </a>
                <span className="text-slate-600">|</span>
                <a href="https://www.doctordreams.in/contact-us" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
                <span className="text-slate-600">|</span>
                <a href="https://www.doctordreams.in/about-us" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}