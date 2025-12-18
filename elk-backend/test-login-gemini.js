import axios from 'axios'
import { config } from 'dotenv'

config()

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const DEFAULT_EMAIL = 'ibrahim@gmail.com'
const DEFAULT_PASSWORD = '12345678'

function short(v, n = 8) {
  if (!v) return ''
  return `${v.slice(0, n)}...(${v.length})`
}

async function requestJson(method, url, data, headers = {}) {
  try {
    const res = await axios({ method, url, data, headers, validateStatus: () => true })
    return res
  } catch (err) {
    if (err instanceof Error) console.error('Request error:', err.message)
    throw err
  }
}

async function run(email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) {
  console.log('\n🔐 1) Login')
  const loginUrl = `${BASE_URL}/api/auth/login`
  console.log('POST', loginUrl)

  const loginRes = await requestJson('post', loginUrl, { email, password })
  console.log('Status:', loginRes.status)
  console.log('Body:', JSON.stringify(loginRes.data, null, 2))

  if (loginRes.status !== 200 && loginRes.status !== 201) {
    console.error('\n❌ Login failed — server did not return 200/201. Check credentials and server logs.')
    return
  }

  // Extract tokens
  const accessToken = loginRes.data?.data?.accessToken || loginRes.data?.accessToken || loginRes.data?.access_token
  const refreshToken = loginRes.data?.data?.refreshToken || loginRes.data?.refreshToken || loginRes.data?.refresh_token

  console.log('\n🔎 Token diagnostics:')
  console.log('Access token:', short(accessToken))
  console.log('Refresh token:', short(refreshToken))

  if (!accessToken) {
    console.error('\n❌ No access token found in login response. Ensure the login route returns an access token.')
    return
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` }

  console.log('\n🟢 2) Initialize Gemini session')
  const initUrl = `${BASE_URL}/api/ai/gemini/initialize`
  const initBody = {
    sessionType: 'LIVE_CONVERSATION',
    profile: 'interview',
    language: 'en-US'
  }

  const initRes = await requestJson('post', initUrl, initBody, authHeader)
  console.log('Status:', initRes.status)
  console.log('Body:', JSON.stringify(initRes.data, null, 2))

  if (initRes.status === 401 || initRes.status === 403) {
    console.error('\n❌ Authentication or authorization failed for initialize endpoint. Token may be invalid or not stored in session table.')
    // print server response for diagnostics
    console.error('Response text:', initRes.data)
    return
  }

  if (!initRes.data?.data?.sessionId && !initRes.data?.sessionId) {
    console.error('\n❌ No sessionId returned from initialize. Check server logs and validation rules.')
    return
  }

  const sessionId = initRes.data?.data?.sessionId || initRes.data?.sessionId
  console.log('\n✅ Session initialized:', sessionId)

  console.log('\n💬 3) Send a text message via unified conversation endpoint')
  const convUrl = `${BASE_URL}/api/ai/gemini/conversation`
  const convBody = {
    sessionId,
    userInput: 'Hello Gemini, can you reply just OK to confirm?',
    inputType: 'text'
  }

  const convRes = await requestJson('post', convUrl, convBody, authHeader)
  console.log('Status:', convRes.status)
  console.log('Body:', JSON.stringify(convRes.data, null, 2))

  if (convRes.status === 401 || convRes.status === 403) {
    console.error('\n❌ Conversation request unauthorized. Token may be invalid, expired, or session mismatch.')
    return
  }

  console.log('\n✅ Conversation response (if success):', convRes.data?.data || convRes.data)

  // Extra diagnostics: try initialize again to check consistency
  console.log('\n🔁 4) (Optional) Re-initialize to test token/session stability')
  const initRes2 = await requestJson('post', initUrl, initBody, authHeader)
  console.log('Status:', initRes2.status, 'Body:', JSON.stringify(initRes2.data, null, 2))

  console.log('\n✅ Done')
}

// Run immediately when executed as a script (ESM-friendly)
const [,, emailArg, passwordArg] = process.argv
run(emailArg || DEFAULT_EMAIL, passwordArg || DEFAULT_PASSWORD).catch(err => {
  console.error('Fatal error:', err?.message || err)
  process.exit(1)
})

export default run
