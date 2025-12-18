/**
 * Test script for authentication and subscription system
 * Run with: node test-auth-system.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';
let accessToken = '';
let userId = '';

async function testRegister() {
    console.log('\n=== Testing User Registration ===');
    
    const email = `test${Date.now()}@example.com`;
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Registration successful');
        console.log(`   Email: ${email}`);
        console.log(`   User ID: ${data.data.user.id}`);
        accessToken = data.data.accessToken;
        userId = data.data.user.id;
        return { email, password: 'password123' };
    } else {
        console.error('❌ Registration failed:', data.error);
        throw new Error(data.error);
    }
}

async function testLogin(email, password) {
    console.log('\n=== Testing User Login ===');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Login successful');
        console.log(`   User: ${data.data.user.email}`);
        console.log(`   Token: ${data.data.accessToken.substring(0, 20)}...`);
        accessToken = data.data.accessToken;
        return data.data.user;
    } else {
        console.error('❌ Login failed:', data.error);
        throw new Error(data.error);
    }
}

async function testGetSubscriptionStatus() {
    console.log('\n=== Testing Get Subscription Status ===');
    
    const response = await fetch(`${API_BASE}/subscription/status`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Subscription status retrieved');
        console.log(`   Plan: ${data.data.subscription.plan}`);
        console.log(`   Status: ${data.data.subscription.status}`);
        console.log('\n   Limits:');
        console.log(`     Screen Q&A: ${data.data.limits.screenQaLimit}/month`);
        console.log(`     Audio Minutes: ${data.data.limits.audioMinutesLimit}/month`);
        console.log(`     Web Queries: ${data.data.limits.webQueriesLimit}/month`);
        console.log('\n   Usage:');
        console.log(`     Screen Q&A: ${data.data.usage.screenQaCount}`);
        console.log(`     Audio Minutes: ${data.data.usage.audioMinutes}`);
        console.log(`     Web Queries: ${data.data.usage.webQueriesCount}`);
        console.log('\n   Remaining:');
        console.log(`     Screen Q&A: ${data.data.remaining.screenQa}`);
        console.log(`     Audio Minutes: ${data.data.remaining.audioMinutes}`);
        console.log(`     Web Queries: ${data.data.remaining.webQueries}`);
        return data.data;
    } else {
        console.error('❌ Failed to get subscription status:', data.error);
        throw new Error(data.error);
    }
}

async function testCheckUsage(featureType, amount = 1) {
    console.log(`\n=== Testing Check Usage: ${featureType} ===`);
    
    const response = await fetch(`${API_BASE}/usage/check`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featureType, amount })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log(`✅ Usage check complete`);
        console.log(`   Can use: ${data.data.canUse ? 'YES' : 'NO'}`);
        console.log(`   Current usage: ${data.data.currentUsage}`);
        console.log(`   Limit: ${data.data.limit}`);
        console.log(`   Remaining: ${data.data.remaining}`);
        return data.data;
    } else {
        console.error('❌ Failed to check usage:', data.error);
        throw new Error(data.error);
    }
}

async function testTrackUsage(featureType, amount) {
    console.log(`\n=== Testing Track Usage: ${featureType} (${amount}) ===`);
    
    const response = await fetch(`${API_BASE}/usage/track`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featureType, amount })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log(`✅ Usage tracked successfully`);
        console.log(`   Screen Q&A: ${data.data.usage.screenQaCount} (${data.data.remaining.screenQa} remaining)`);
        console.log(`   Audio Minutes: ${data.data.usage.audioMinutes} (${data.data.remaining.audioMinutes} remaining)`);
        console.log(`   Web Queries: ${data.data.usage.webQueriesCount} (${data.data.remaining.webQueries} remaining)`);
        return data.data;
    } else {
        console.error('❌ Failed to track usage:', data.error);
        if (data.data?.limitExceeded) {
            console.log('   ⚠️ Limit exceeded - upgrade required');
        }
        throw new Error(data.error);
    }
}

async function testUpgrade() {
    console.log('\n=== Testing Upgrade to Pro ===');
    
    const response = await fetch(`${API_BASE}/subscription/upgrade`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            plan: 'PRO',
            paypalSubscriptionId: 'test-subscription-id'
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Upgrade successful');
        console.log(`   New plan: ${data.data.subscription.plan}`);
        console.log(`   Status: ${data.data.subscription.status}`);
        return data.data;
    } else {
        console.error('❌ Failed to upgrade:', data.error);
        throw new Error(data.error);
    }
}

async function runTests() {
    console.log('🚀 Starting Authentication & Subscription System Tests');
    console.log('================================================\n');
    
    try {
        // 1. Register a new user
        const { email, password } = await testRegister();
        
        // 2. Login with the new user
        await testLogin(email, password);
        
        // 3. Get subscription status (should be FREE plan)
        await testGetSubscriptionStatus();
        
        // 4. Check usage for each feature
        await testCheckUsage('SCREEN_QA');
        await testCheckUsage('AUDIO_MINUTES');
        await testCheckUsage('WEB_QUERIES');
        
        // 5. Track some usage
        await testTrackUsage('SCREEN_QA', 1);
        await testTrackUsage('AUDIO_MINUTES', 0.5);
        
        // 6. Try to track web query (should fail for FREE plan)
        try {
            await testTrackUsage('WEB_QUERIES', 1);
        } catch (error) {
            console.log('   ℹ️ Expected: Web queries not available on FREE plan');
        }
        
        // 7. Upgrade to Pro
        await testUpgrade();
        
        // 8. Get updated subscription status
        await testGetSubscriptionStatus();
        
        // 9. Try web query again (should work now)
        await testCheckUsage('WEB_QUERIES');
        await testTrackUsage('WEB_QUERIES', 1);
        
        console.log('\n================================================');
        console.log('✅ All tests passed successfully!');
        console.log('================================================\n');
        
    } catch (error) {
        console.log('\n================================================');
        console.error('❌ Tests failed:', error.message);
        console.log('================================================\n');
        process.exit(1);
    }
}

// Run the tests
runTests();
