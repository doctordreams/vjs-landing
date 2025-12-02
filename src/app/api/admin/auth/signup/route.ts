import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate username (alphanumeric and underscore only, 3-20 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await db.admin.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = await db.admin.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await db.admin.create({
      data: {
        username,
        email,
        passwordHash
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating admin account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

