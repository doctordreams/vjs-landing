import bcrypt from 'bcryptjs'

export interface AdminUser {
  username: string
  passwordHash: string
}

export interface SessionData {
  username: string
  loginTime: number
  expiresAt: number
}

// Get admin credentials from environment variables
export function getAdminCredentials(): AdminUser {
  const username = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (!username || !passwordHash) {
    throw new Error('Admin credentials not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD_HASH environment variables.')
  }

  return { username, passwordHash }
}

// Hash a plain text password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Create a session token (simple implementation - in production, use JWT or proper session management)
export function createSessionToken(username: string): string {
  const sessionData: SessionData = {
    username,
    loginTime: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }

  // In production, you should use proper JWT signing or secure session storage
  const tokenData = JSON.stringify(sessionData)
  return Buffer.from(tokenData).toString('base64')
}

// Verify a session token
export function verifySessionToken(token: string): SessionData | null {
  try {
    const decodedData = Buffer.from(token, 'base64').toString('utf-8')
    const sessionData: SessionData = JSON.parse(decodedData)

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null
    }

    return sessionData
  } catch (error) {
    console.error('Invalid session token:', error)
    return null
  }
}

// Check if user is authenticated (server-side check)
export function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies['admin_session']

  if (!sessionToken) {
    return false
  }

  const sessionData = verifySessionToken(sessionToken)
  return sessionData !== null
}

// Get session data from request
export function getSessionData(request: Request): SessionData | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies['admin_session']

  if (!sessionToken) {
    return null
  }

  return verifySessionToken(sessionToken)
}

// Simple cookie parser
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  if (!cookieHeader) {
    return cookies
  }

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    const value = rest.join('=')
    cookies[name] = value
  })

  return cookies
}

// Set session cookie in response
export function setSessionCookie(response: Response, token: string): Response {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = [
    'admin_session=' + token,
    'HttpOnly', // Prevents JavaScript access
    ...(isProduction ? ['Secure'] : []), // Only send over HTTPS in production
    'SameSite=Strict',
    'Path=/',
    'Max-Age=' + (24 * 60 * 60) // 24 hours
  ].join('; ')

  response.headers.set('Set-Cookie', cookieOptions)
  return response
}

// Clear session cookie
export function clearSessionCookie(response: Response): Response {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = [
    'admin_session=',
    'HttpOnly',
    ...(isProduction ? ['Secure'] : []), // Only send over HTTPS in production
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0'
  ].join('; ')

  response.headers.set('Set-Cookie', cookieOptions)
  return response
}
