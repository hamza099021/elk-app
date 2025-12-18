import { GoogleGenAI } from '@google/genai'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

async function testUpdatedModels() {
  console.log('🔍 Testing updated Gemini models...\n')
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...')
  
  const client = new GoogleGenAI({ apiKey })
  
  // Test the models we're now using
  const modelsToTest = [
    'models/gemini-2.5-flash',
    'models/gemini-2.5-pro',
    'models/gemini-2.0-flash'
  ]
  
  console.log('\n🧪 Testing our new model choices...\n')
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`)
      
      const model = client.getGenerativeModel({ model: modelName })
      
      // Test basic text generation
      const textResult = await model.generateContent('Hello, respond with just "OK" if you can hear me.')
      const textResponse = await textResult.response
      const text = textResponse.text()
      
      console.log(`✅ ${modelName}: Text SUCCESS - Response: "${text.trim()}"`)
      
      // Test multimodal (image) support
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
        console.log(`  📸 ${modelName}: Image support YES - "${imageResponse.text().trim().substring(0, 50)}..."`)
      } catch (imageError) {
        console.log(`  📸 ${modelName}: Image support NO - ${imageError.message.substring(0, 50)}`)
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.log(`❌ ${modelName}: ERROR - ${errorMsg.substring(0, 100)}`)
    }
  }
  
  console.log('\n✅ Model testing complete!')
}

// Run the test
testUpdatedModels().catch(console.error)