import fetch from 'node-fetch'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

async function listModels() {
  console.log('🔍 Listing available Gemini models via REST API...\n')
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...')
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('\n📋 Available models:')
    
    if (data.models && Array.isArray(data.models)) {
      for (const model of data.models) {
        console.log(`\n🤖 ${model.name}`)
        if (model.displayName) console.log(`   Display Name: ${model.displayName}`)
        if (model.description) console.log(`   Description: ${model.description}`)
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`)
        }
        if (model.version) console.log(`   Version: ${model.version}`)
        if (model.baseModelId) console.log(`   Base Model: ${model.baseModelId}`)
      }
      
      console.log(`\n✅ Found ${data.models.length} models`)
      
      // Test the first available model
      const firstModel = data.models.find(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes('generateContent')
      )
      
      if (firstModel) {
        console.log(`\n🧪 Testing first available model: ${firstModel.name}`)
        await testModel(firstModel.name, apiKey)
      }
      
    } else {
      console.log('❌ No models found in response:', data)
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message)
  }
}

async function testModel(modelName, apiKey) {
  try {
    const requestBody = {
      contents: [{
        parts: [{ text: "Hello, can you respond with just 'OK'?" }]
      }]
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Test failed: ${errorText}`)
      return
    }
    
    const result = await response.json()
    console.log(`✅ Test successful!`)
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const text = result.candidates[0].content.parts[0].text
      console.log(`   Response: "${text.trim()}"`)
    }
    
  } catch (error) {
    console.error(`❌ Test error:`, error.message)
  }
}

// Run the test
listModels().catch(console.error)