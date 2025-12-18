import { GoogleGenAI } from '@google/genai'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Access...\n')
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables')
    console.error('Make sure you have a .env file with GEMINI_API_KEY=your_api_key')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...')
  
  const client = new GoogleGenAI({ apiKey })
  
  // Try the current recommended models according to Google AI Studio
  const modelsToTest = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-1.0-pro-vision',
    'gemini-1.0-pro-latest',
    'gemini-pro',
    'gemini-pro-vision',
    'text-bison-001',
    'chat-bison-001',
  ]
  
  console.log('\n🧪 Testing model availability...\n')
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`)
      
      const model = client.getGenerativeModel({ model: modelName })
      
      // Test basic text generation
      const prompt = "Say hello"
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log(`✅ ${modelName}: SUCCESS`)
      console.log(`   Response: "${text.trim()}"`)
      
      // Try to get model info if available
      if (model.model) {
        console.log(`   Model info: ${model.model}`)
      }
      
      return modelName // Return first working model
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.log(`❌ ${modelName}: NOT FOUND`)
      } else if (errorMsg.includes('403') || errorMsg.includes('permission')) {
        console.log(`🔒 ${modelName}: PERMISSION DENIED`)
      } else if (errorMsg.includes('400')) {
        console.log(`⚠️  ${modelName}: BAD REQUEST - ${errorMsg.substring(0, 100)}`)
      } else {
        console.log(`⚠️  ${modelName}: ERROR - ${errorMsg.substring(0, 100)}`)
      }
    }
  }
  
  console.log('\n❌ No working models found!')
  
  // Try to inspect the client object
  console.log('\n🔍 Inspecting GoogleGenerativeAI client...')
  console.log('Client keys:', Object.keys(client))
  
  // Try different initialization
  console.log('\n🔄 Trying alternative initialization...')
  try {
    const model = client.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 100,
      }
    })
    console.log('Model object created:', Object.keys(model))
    
    // Try generateContent with different approach
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{text: 'Hello'}]
      }]
    })
    console.log('✅ Alternative approach works!')
    
  } catch (altError) {
    console.log('❌ Alternative approach failed:', altError.message)
  }
}

// Run the test
testGeminiAPI().catch(console.error)