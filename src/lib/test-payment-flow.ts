// Test function to demonstrate payment flow
export function testPaymentFlow() {
  console.log('=== Testing Payment Flow ===')
  
  // Fill form with test data
  window.fillTestForm()
  
  // Submit form to initiate payment
  const submitButton = document.querySelector('button[type="submit"]')
  if (submitButton) {
    submitButton.click()
  }
  
  console.log('Payment flow test completed!')
}

  return 'Test data filled and submitted successfully'
}

// Auto-execute on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('Auto-filling form with test data...')
    window.fillTestForm()
  })
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testPaymentFlow = testPaymentFlow
}
}