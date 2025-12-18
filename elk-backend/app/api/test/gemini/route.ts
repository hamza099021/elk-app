import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  try {
    console.log('🔍 Testing Gemini API connection...')
    
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const client = new GoogleGenAI({ apiKey })
    const model = (client as any).getGenerativeModel({ model: 'models/gemini-2.5-flash' })
    
    // Simple test
    const result = await model.generateContent('Say "Hello from Elk AI Backend!" if you can hear me.')
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini API test successful')

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working correctly',
      model: 'models/gemini-2.5-flash',
      response: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Gemini API test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gemini API test failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}