// API base URL - switch between local and production
// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://backend.elkai.cloud/api';

// Event emitter for auth state changes
const authEventListeners = [];

export function onAuthStateChange(callback) {
    authEventListeners.push(callback);
    return () => {
        const index = authEventListeners.indexOf(callback);
        if (index > -1) authEventListeners.splice(index, 1);
    };
}

function emitAuthStateChange(isAuthenticated, user = null) {
    authEventListeners.forEach(cb => cb(isAuthenticated, user));
}

// Clear all auth data and redirect to login
function clearAuthData() {
    console.log('🔐 Clearing all auth data...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('isAuthenticated');
    emitAuthStateChange(false);
}

// Helper to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');
    
    if (!token) {
        console.error('❌ No access token found in localStorage!');
        console.log('Available localStorage keys:', Object.keys(localStorage));
    }
    
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
}

// Wrapper for API calls that handles token refresh
async function fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });
    
    // If 401 Unauthorized, try to refresh token
    if (response.status === 401) {
        console.log('🔄 Access token expired, attempting refresh...');
        const refreshed = await authAPI.refreshToken();
        
        if (refreshed) {
            // Retry the original request with new token
            console.log('✅ Token refreshed, retrying request...');
            return fetch(url, {
                ...options,
                headers: {
                    ...getAuthHeaders(),
                    ...options.headers,
                },
            });
        } else {
            // Refresh failed, clear auth and redirect to login
            console.log('❌ Token refresh failed, clearing auth...');
            clearAuthData();
            throw new Error('Session expired. Please log in again.');
        }
    }
    
    return response;
}

// Auth APIs
export const authAPI = {
    async login(email, password) {
        console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        console.log('🔐 Login response:', { success: data.success, hasData: !!data.data, status: response.status });
        
        if (data.success && data.data) {
            // Store tokens
            console.log('🔐 Storing tokens...');
            console.log('🔐 AccessToken received:', data.data.accessToken ? data.data.accessToken.substring(0, 30) + '...' : 'NONE');
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('userId', data.data.user.id);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isAuthenticated', 'true');
            
            // Verify storage worked
            const storedToken = localStorage.getItem('accessToken');
            console.log('🔐 Verified stored token:', storedToken ? storedToken.substring(0, 30) + '...' : 'STORAGE FAILED');
            
            if (data.data.user.subscription) {
                localStorage.setItem('userPlan', data.data.user.subscription.plan);
            }
            
            emitAuthStateChange(true, data.data.user);
        }
        
        return data;
    },

    async register(email, password, firstName, lastName) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName }),
        });
        return response.json();
    },
    
    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            console.log('❌ No refresh token available');
            return false;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            
            const data = await response.json();
            
            if (data.success && data.data) {
                // Update tokens
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                
                if (data.data.user.subscription) {
                    localStorage.setItem('userPlan', data.data.user.subscription.plan);
                }
                
                console.log('✅ Tokens refreshed successfully');
                emitAuthStateChange(true, data.data.user);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Token refresh error:', error);
            return false;
        }
    },
    
    async validateToken() {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            console.log('❌ No access token to validate');
            return { valid: false, user: null };
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            
            const data = await response.json();
            
            if (data.success && data.data?.valid) {
                // Update subscription plan if available
                if (data.data.user?.subscription) {
                    localStorage.setItem('userPlan', data.data.user.subscription.plan);
                }
                console.log('✅ Token is valid, user:', data.data.user?.email);
                return { valid: true, user: data.data.user };
            }
            
            // Token invalid, try refresh
            console.log('🔄 Token invalid, attempting refresh...');
            const refreshed = await this.refreshToken();
            
            if (refreshed) {
                // Validate again after refresh
                const retryResponse = await fetch(`${API_BASE_URL}/auth/validate`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });
                const retryData = await retryResponse.json();
                
                if (retryData.success && retryData.data?.valid) {
                    return { valid: true, user: retryData.data.user };
                }
            }
            
            return { valid: false, user: null };
        } catch (error) {
            console.error('❌ Token validation error:', error);
            return { valid: false, user: null };
        }
    },
    
    logout() {
        clearAuthData();
    },
    
    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true' && 
               localStorage.getItem('accessToken') !== null;
    },
};

// Subscription APIs
export const subscriptionAPI = {
    async getStatus() {
        console.log('📡 Calling subscription status API...');
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/subscription/status`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('📡 Subscription status response:', response.status, data);
            return data;
        } catch (error) {
            console.error('❌ Subscription status error:', error);
            return { success: false, error: error.message };
        }
    },

    async upgrade(plan, paypalSubscriptionId = null) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/subscription/upgrade`, {
                method: 'POST',
                body: JSON.stringify({ plan, paypalSubscriptionId }),
            });
            return response.json();
        } catch (error) {
            console.error('❌ Subscription upgrade error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Usage APIs
export const usageAPI = {
    async check(featureType, amount = 1) {
        try {
            console.log('📊 Usage check - featureType:', featureType, 'amount:', amount);
            console.log('📊 Token check:', localStorage.getItem('accessToken') ? 'TOKEN EXISTS' : 'NO TOKEN');
            const response = await fetchWithAuth(`${API_BASE_URL}/usage/check`, {
                method: 'POST',
                body: JSON.stringify({ featureType, amount }),
            });
            const data = await response.json();
            console.log('📊 Usage check response:', response.status, data);
            return data;
        } catch (error) {
            console.error('❌ Usage check error:', error);
            return { success: false, error: error.message };
        }
    },

    async track(featureType, amount) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/usage/track`, {
                method: 'POST',
                body: JSON.stringify({ featureType, amount }),
            });
            return response.json();
        } catch (error) {
            console.error('❌ Usage track error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Feature type constants
export const FeatureType = {
    SCREEN_QA: 'SCREEN_QA',
    AUDIO_MINUTES: 'AUDIO_MINUTES',
    WEB_QUERIES: 'WEB_QUERIES',
};

// AI APIs - All AI calls routed through backend
export const aiAPI = {
    // Gemini APIs
    gemini: {
        async initializeSession(profile = 'interview', language = 'en-US', customPrompt = '', googleSearchEnabled = true) {
            try {
                console.log('🤖 Initializing Gemini session via backend...');
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/initialize`, {
                    method: 'POST',
                    body: JSON.stringify({
                        sessionType: 'INTERVIEW',
                        profile,
                        language,
                        customPrompt,
                        googleSearchEnabled,
                    }),
                });
                const data = await response.json();
                console.log('🤖 Gemini session response:', data);
                return data;
            } catch (error) {
                console.error('❌ Gemini initialize error:', error);
                return { success: false, error: error.message };
            }
        },

        async sendText(sessionId, text) {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/send-text`, {
                    method: 'POST',
                    body: JSON.stringify({ sessionId, text }),
                });
                return response.json();
            } catch (error) {
                console.error('❌ Gemini send text error:', error);
                return { success: false, error: error.message };
            }
        },

        async sendAudio(sessionId, audioData, mimeType = 'audio/pcm', sampleRate = 16000) {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/send-audio`, {
                    method: 'POST',
                    body: JSON.stringify({ sessionId, audioData, mimeType, sampleRate }),
                });
                return response.json();
            } catch (error) {
                console.error('❌ Gemini send audio error:', error);
                return { success: false, error: error.message };
            }
        },

        async sendImage(sessionId, imageData, mimeType = 'image/png', prompt = '') {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/send-image`, {
                    method: 'POST',
                    body: JSON.stringify({ sessionId, imageData, mimeType, prompt }),
                });
                return response.json();
            } catch (error) {
                console.error('❌ Gemini send image error:', error);
                return { success: false, error: error.message };
            }
        },

        async closeSession(sessionId) {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/close`, {
                    method: 'POST',
                    body: JSON.stringify({ sessionId }),
                });
                return response.json();
            } catch (error) {
                console.error('❌ Gemini close session error:', error);
                return { success: false, error: error.message };
            }
        },

        // Get API key from backend (for direct Gemini calls in Electron)
        async getApiKey() {
            try {
                console.log('🔑 Fetching Gemini API key from backend...');
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/gemini/key`, {
                    method: 'GET',
                });
                const data = await response.json();
                if (data.success && data.data?.apiKey) {
                    console.log('🔑 Gemini API key retrieved successfully');
                    return data.data.apiKey;
                }
                console.error('❌ Failed to get Gemini API key:', data.error);
                return null;
            } catch (error) {
                console.error('❌ Gemini get API key error:', error);
                return null;
            }
        },
    },

    // Perplexity API
    perplexity: {
        async search(query, options = {}) {
            try {
                console.log('🔍 Searching via backend Perplexity API...');
                const response = await fetchWithAuth(`${API_BASE_URL}/ai/perplexity/search`, {
                    method: 'POST',
                    body: JSON.stringify({
                        query,
                        maxResults: options.maxResults || 10,
                        includeImages: options.includeImages || false,
                        includeDomains: options.includeDomains,
                        excludeDomains: options.excludeDomains,
                    }),
                });
                const data = await response.json();
                console.log('🔍 Perplexity search response:', data);
                return data;
            } catch (error) {
                console.error('❌ Perplexity search error:', error);
                return { success: false, error: error.message };
            }
        },
    },
};