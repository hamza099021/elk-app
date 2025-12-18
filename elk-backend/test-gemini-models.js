import { GoogleGenAI } from '@google/genai'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

async function testGeminiModels() {
  console.log('🔍 Testing Gemini API Models...\n')
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables')
    console.error('Make sure you have a .env file with GEMINI_API_KEY=your_api_key')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...')
  
  const client = new GoogleGenAI({ apiKey })
  
  // List of models to test
  const modelsToTest = [
    'gemini-pro',
    'gemini-pro-vision', 
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash'
  ]
  
  console.log('\n🧪 Testing different model names...\n')
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`)
      
      const model = client.getGenerativeModel({ model: modelName })
      
      // Test basic text generation
      const result = await model.generateContent('Hello, respond with just "OK" if you can hear me.')
      const response = await result.response
      const text = response.text()
      
      console.log(`✅ ${modelName}: SUCCESS - Response: "${text.trim()}"`)
      
      // Test if it supports images (for vision models)
      if (modelName.includes('vision') || modelName.includes('1.5')) {
        try {
          const imageResult = await model.generateContent([
            { text: "What color is this pixel?" },
            {
              inlineData: {
                data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // 1x1 red pixel
                mimeType: "image/png"
              }
            }
          ])
          const imageResponse = await imageResult.response
          console.log(`  📸 Image support: YES - "${imageResponse.text().trim().substring(0, 50)}..."`)
        } catch (imageError) {
          console.log(`  📸 Image support: NO`)
        }
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.log(`❌ ${modelName}: NOT FOUND`)
      } else if (errorMsg.includes('403') || errorMsg.includes('permission')) {
        console.log(`🔒 ${modelName}: PERMISSION DENIED`)
      } else {
        console.log(`⚠️  ${modelName}: ERROR - ${errorMsg.substring(0, 100)}`)
      }
    }
  }
  
  console.log('\n🔍 Trying to list available models...\n')
  
  // Try to list available models if the API supports it
  try {
    const models = await client.listModels()
    console.log('📋 Available models:')
    for await (const model of models) {
      console.log(`  - ${model.name} (${model.displayName})`)
      if (model.supportedGenerationMethods) {
        console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`)
      }
    }
  } catch (error) {
    console.log('❌ Could not list models:', error.message)
  }
  
  console.log('\n✅ Model testing complete!')
}

// Run the test
testGeminiModels().catch(console.error)