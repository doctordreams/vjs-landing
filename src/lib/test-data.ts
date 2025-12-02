// Test function to pre-fill form with Bangalore NEET aspirant student data
export function fillTestForm() {
  const testStudent = {
    studentName: 'Rahul Kumar',
    fatherName: 'Srinivas Rao',
    motherName: 'Lakshmi Devi',
    studentMobile: '9876543210',
    fatherMobile: '9876543211',
    motherMobile: '9876543212',
    email: 'rahul.kumar@example.com',
    address: '#123, 5th Cross, Rajaji Nagar, Bangalore, Karnataka - 560001',
    pincode: '560001',
    taluk: 'Bangalore North',
    district: 'Bangalore',
    presentCollege: 'National College of Engineering',
    tenthPercentage: '92.5',
    ddRepresentative: 'Dr. Chandrasekhar',
    countryPreference: 'usa',
    collegePreference: 'MIT, Stanford',
    budget: '50+',
    facilities: 'Research facilities, lab access, accommodation'
  }

  // Auto-fill the form
  const fillForm = () => {
    const form = document.querySelector('form')
    if (!form) return

    // Fill all input fields
    const fields = [
      'studentName', 'fatherName', 'motherName', 'studentMobile',
      'fatherMobile', 'motherMobile', 'email', 'address', 'pincode',
      'taluk', 'district', 'presentCollege', 'tenthPercentage',
      'ddRepresentative', 'countryPreference', 'collegePreference', 'budget', 'facilities'
    ]

    fields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement
      const textarea = form.querySelector(`[name="${field}"]`) as HTMLTextAreaElement
      
      if (input) {
        input.value = testStudent[field] || ''
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
      
      if (textarea) {
        textarea.value = testStudent[field] || ''
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    // Trigger change events
    fields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement
      const textarea = form.querySelector(`[name="${field}"]`) as HTMLTextAreaElement
      
      if (input) {
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
      
      if (textarea) {
        textarea.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    console.log('Test form filled with Bangalore NEET aspirant data:', testStudent)
    return testStudent
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.fillTestForm = fillTestForm
}