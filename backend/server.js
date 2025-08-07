// Complete Gong Expansion Opportunity Tracker - Backend Service
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration - Updated for your working API structure
const GONG_CONFIG = {
  baseURL: (process.env.GONG_BASE_URL || 'https://us-47829.api.gong.io').replace(/\/$/, '') + '/v2',
  accessKey: process.env.GONG_ACCESS_KEY,
  accessKeySecret: process.env.GONG_ACCESS_KEY_SECRET
};

// Expansion opportunity keywords - Customize for ShipBob
const EXPANSION_KEYWORDS = [
  'expansion', 'upgrade', 'additional features', 'more users', 'enterprise plan',
  'scale up', 'add-on', 'premium', 'increase capacity', 'additional licenses',
  'grow', 'enterprise', 'more seats', 'additional modules', 'premium support',
  'advanced features', 'bigger plan', 'enterprise tier', 'professional plan',
  // ShipBob-specific terms
  'more inventory', 'additional fulfillment', 'peak season', 'more orders',
  'multiple warehouses', 'international shipping', 'faster shipping',
  'premium features', 'dedicated support', 'custom integration'
];

// Solution Manager mappings - UPDATE THESE FOR YOUR ORGANIZATION
const MERCHANT_SM_MAPPING = {
  'TECH-001': { sm: 'Mike Chen', email: 'mike.c@shipbob.com' },
  'GROW-002': { sm: 'Emma Rodriguez', email: 'emma.r@shipbob.com' },
  'ENT-003': { sm: 'Tom Wilson', email: 'tom.w@shipbob.com' }
  // Add your actual merchant-SM mappings here
};

// In-memory storage (use a database in production)
let opportunities = [];
let processedCalls = new Set();

class GongAPIService {
  constructor() {
    console.log('🔧 Initializing Gong API Service with Basic Auth');
  }

  // Get authentication headers (Basic Auth with key:secret)
  getAuthHeaders() {
    const credentials = Buffer.from(`${GONG_CONFIG.accessKey}:${GONG_CONFIG.accessKeySecret}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  // Get recent calls from Gong
  async getRecentCalls(fromDate = null, pageSize = 50) {
    try {
      console.log('🔍 Fetching calls from Gong...');

      // Try basic call first (no date filter) to ensure we get some data
      let response;
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate).toISOString();
        const toDateTime = new Date().toISOString();
        
        console.log(`📅 Using date filter: ${fromDateTime} to ${toDateTime}`);
        
        // Try with date parameters
        try {
          response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
            headers: this.getAuthHeaders(),
            params: {
              fromDateTime,
              toDateTime,
              pageSize
            }
          });
        } catch (dateError) {
          console.log('⚠️ Date filtering failed, trying without date filter...');
          response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
            headers: this.getAuthHeaders(),
            params: { pageSize }
          });
        }
      } else {
        // Get recent calls without date filter
        response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
          headers: this.getAuthHeaders(),
          params: { pageSize }
        });
      }

      const calls = response.data.records?.calls || [];
      const totalRecords = response.data.records?.totalRecords || 0;
      
      console.log(`✅ Retrieved ${calls.length} calls (Total available: ${totalRecords})`);

      // If calls don't have parties data, try to get it separately
      const callsWithParties = await this.enrichCallsWithParties(calls);

      return {
        calls: callsWithParties,
        totalRecords,
        cursor: response.data.records?.cursor
      };
    } catch (error) {
      console.error('❌ Failed to fetch calls:', error.response?.data || error.message);
      throw error;
    }
  }

  // Enrich calls with participant data if missing
  async enrichCallsWithParties(calls) {
    const enrichedCalls = [];
    
    for (const call of calls) {
      if (!call.parties || call.parties.length === 0) {
        try {
          // Try to get detailed call info
          const detailResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${call.id}`, {
            headers: this.getAuthHeaders(),
            params: {
              contentSelector: JSON.stringify({
                exposedFields: {
                  parties: true,
                  recording: true
                }
              })
            }
          });
          
          const enrichedCall = { ...call, ...detailResponse.data };
          enrichedCalls.push(enrichedCall);
          console.log(`✅ Enriched call ${call.id} with ${enrichedCall.parties?.length || 0} parties`);
        } catch (enrichError) {
          console.log(`⚠️ Could not enrich call ${call.id}, using original data`);
          enrichedCalls.push(call);
        }
      } else {
        enrichedCalls.push(call);
      }
    }
    
    return enrichedCalls;
  }

  // Get call transcript
  async getCallTranscript(callId) {
    try {
      console.log(`📝 Fetching transcript for call: ${callId}`);
      
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}/transcript`, {
        headers: this.getAuthHeaders()
      });

      if (response.data && response.data.entries) {
        console.log(`✅ Retrieved transcript with ${response.data.entries.length} entries`);
        return response.data;
      } else {
        console.log('⚠️ No transcript entries found');
        return null;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⚠️ Transcript not found for call ${callId} (may still be processing)`);
      } else {
        console.error(`❌ Failed to fetch transcript for call ${callId}:`, error.response?.data || error.message);
      }
      return null;
    }
  }

  // Analyze transcript for expansion opportunities
  analyzeTranscript(transcript, keywords = EXPANSION_KEYWORDS) {
    if (!transcript || !transcript.entries) return { score: 0, detectedKeywords: [] };

    const fullText = transcript.entries
      .map(entry => entry.text)
      .join(' ')
      .toLowerCase();

    const detectedKeywords = keywords.filter(keyword => 
      fullText.includes(keyword.toLowerCase())
    );

    // Calculate opportunity score based on keyword frequency and context
    let score = 0;
    detectedKeywords.forEach(keyword => {
      const matches = (fullText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      score += matches * 1.5;
    });

    // Boost score for high-value keywords
    const highValueKeywords = ['enterprise', 'expansion', 'upgrade', 'scale up', 'peak season'];
    highValueKeywords.forEach(keyword => {
      if (detectedKeywords.includes(keyword)) {
        score += 2;
      }
    });

    // Normalize score to 0-10 scale
    score = Math.min(10, score);

    return {
      score: Math.round(score * 10) / 10,
      detectedKeywords,
      fullText: fullText.substring(0, 500) // First 500 chars for preview
    };
  }

  // Check if Solution Manager was present in the call
  isSolutionManagerPresent(parties, merchantId) {
    if (!parties || parties.length === 0) {
      console.log('⚠️ No parties data available for this call');
      return false;
    }

    const smInfo = MERCHANT_SM_MAPPING[merchantId];
    if (!smInfo) {
      console.log(`⚠️ No SM mapping found for merchant: ${merchantId}`);
      return false;
    }

    return parties.some(party => 
      party.name && party.name.toLowerCase().includes(smInfo.sm.toLowerCase())
    );
  }

  // Extract merchant information from call
  extractMerchantInfo(parties) {
    if (!parties || parties.length === 0) {
      console.log('⚠️ No parties data - using fallback merchant identification');
      return {
        name: 'Unknown Merchant',
        email: 'unknown@merchant.com',
        merchantId: 'UNKNOWN'
      };
    }

    // Find external participant (not from ShipBob domain)
    const merchant = parties.find(party => 
      party.emailAddress && !party.emailAddress.includes('@shipbob.com')
    );

    if (!merchant) {
      console.log('⚠️ Could not identify merchant in call parties');
      return {
        name: 'Unknown Merchant',
        email: 'unknown@merchant.com',
        merchantId: 'UNKNOWN'
      };
    }

    return {
      name: merchant.name || 'Unknown Merchant',
      email: merchant.emailAddress,
      merchantId: this.getMerchantId(merchant.emailAddress)
    };
  }

  // Get merchant ID (this would typically query your CRM)
  getMerchantId(email) {
    // Mock implementation - replace with actual CRM lookup
    const domain = email?.split('@')[1];
    const mockMappings = {
      'techcorp.com': 'TECH-001',
      'growthstart.com': 'GROW-002',
      'entdynamics.com': 'ENT-003'
    };
    return mockMappings[domain] || `MERCHANT-${domain?.replace('.', '-').toUpperCase() || 'UNKNOWN'}`;
  }

  // Process a single call for expansion opportunities
  async processCall(call) {
    try {
      // Skip if already processed
      if (processedCalls.has(call.id)) return null;

      const merchant = this.extractMerchantInfo(call.parties);
      const smPresent = this.isSolutionManagerPresent(call.parties, merchant.merchantId);

      // Only process calls where SM was not present
      if (smPresent) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - SM was present`);
        return null;
      }

      // Get transcript
      const transcript = await this.getCallTranscript(call.id);
      if (!transcript) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - no transcript available`);
        return null;
      }

      // Analyze for expansion opportunities
      const analysis = this.analyzeTranscript(transcript);

      // Only flag if significant opportunity detected
      if (analysis.score < 5.0 || analysis.detectedKeywords.length === 0) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - low opportunity score (${analysis.score})`);
        return null;
      }

      // Find MSM (internal attendee who is not SM)
      const msm = call.parties?.find(party => 
        party.emailAddress && 
        party.emailAddress.includes('@shipbob.com') &&
        !this.isSolutionManagerPresent([party], merchant.merchantId)
      );

      const opportunity = {
        id: `OPP-${call.id}`,
        callId: call.id,
        merchant: merchant.name,
        merchantId: merchant.merchantId,
        merchantEmail: merchant.email,
        callDate: new Date(call.started).toISOString().split('T')[0],
        callDuration: Math.round(call.duration / 60) + ' mins',
        msm: msm?.name || 'Unknown MSM',
        msmEmail: msm?.emailAddress,
        assignedSM: MERCHANT_SM_MAPPING[merchant.merchantId]?.sm || 'Unassigned',
        smEmail: MERCHANT_SM_MAPPING[merchant.merchantId]?.email,
        transcript: analysis.fullText,
        detectedKeywords: analysis.detectedKeywords,
        opportunityScore: analysis.score,
        status: 'pending',
        callRecordingUrl: call.url,
        attendees: call.parties?.map(p => p.name).filter(Boolean) || [],
        smPresent: false,
        flaggedAt: new Date().toISOString()
      };

      opportunities.push(opportunity);
      processedCalls.add(call.id);

      console.log(`🚩 New expansion opportunity flagged: ${merchant.name} (Score: ${analysis.score})`);
      
      // Send notification to SM
      await this.notifySolutionManager(opportunity);

      return opportunity;
    } catch (error) {
      console.error(`❌ Error processing call ${call.id}:`, error.message);
      return null;
    }
  }

  // Send notification to Solution Manager
  async notifySolutionManager(opportunity) {
    try {
      console.log(`📧 Notifying ${opportunity.assignedSM} about opportunity with ${opportunity.merchant}`);
      
      // Example: Send email notification
      // await sendEmail({
      //   to: opportunity.smEmail,
      //   subject: `New Expansion Opportunity: ${opportunity.merchant}`,
      //   template: 'expansion-opportunity',
      //   data: opportunity
      // });

      // Example: Send Slack notification
      // await sendSlackMessage({
      //   channel: '@' + opportunity.assignedSM.toLowerCase().replace(' ', '.'),
      //   message: `🚩 New expansion opportunity detected with ${opportunity.merchant} (Score: ${opportunity.opportunityScore}/10)`
      // });

    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
    }
  }

  // Main scanning function
  async scanForOpportunities(daysBack = 7) {
    try {
      console.log('🔍 Starting expansion opportunity scan...');
      
      const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      const result = await this.getRecentCalls(fromDate);
      const calls = result.calls || [];
      
      console.log(`📞 Found ${calls.length} recent calls to analyze (Total: ${result.totalRecords})`);

      if (calls.length === 0) {
        console.log(`⚠️ No calls found in the last ${daysBack} days. Try increasing the date range or check if there have been recent calls.`);
        return { processedCalls: 0, newOpportunities: 0, totalCallsAvailable: result.totalRecords };
      }

      let newOpportunities = 0;
      let processedCount = 0;

      for (const call of calls) {
        try {
          const opportunity = await this.processCall(call);
          if (opportunity) {
            newOpportunities++;
          }
          processedCount++;

          // Log progress every 10 calls
          if (processedCount % 10 === 0) {
            console.log(`📊 Processed ${processedCount}/${calls.length} calls...`);
          }
        } catch (error) {
          console.error(`❌ Error processing call ${call.id}:`, error.message);
        }
      }

      console.log(`✅ Scan complete. Processed ${processedCount} calls, found ${newOpportunities} new expansion opportunities.`);
      return { 
        processedCalls: processedCount, 
        newOpportunities,
        totalCallsAvailable: result.totalRecords 
      };
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      throw error;
    }
  }
}

// Initialize service
const gongService = new GongAPIService();

// API Routes

// Get all opportunities
app.get('/api/opportunities', (req, res) => {
  const { status, sm } = req.query;
  let filtered = opportunities;

  if (status && status !== 'all') {
    filtered = filtered.filter(opp => opp.status === status);
  }
  
  if (sm && sm !== 'all') {
    filtered = filtered.filter(opp => opp.assignedSM === sm);
  }

  res.json(filtered);
});

// Acknowledge opportunity
app.post('/api/opportunities/:id/acknowledge', (req, res) => {
  const opportunity = opportunities.find(opp => opp.id === req.params.id);
  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  opportunity.status = 'acknowledged';
  opportunity.acknowledgedAt = new Date().toISOString();
  opportunity.acknowledgedBy = req.body.acknowledgedBy;

  res.json(opportunity);
});

// Manual scan trigger
app.post('/api/scan', async (req, res) => {
  try {
    const { daysBack = 7 } = req.body;
    console.log(`🔍 Manual scan triggered for last ${daysBack} days`);
    
    const result = await gongService.scanForOpportunities(daysBack);
    res.json(result);
  } catch (error) {
    console.error('❌ Manual scan failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get keywords
app.get('/api/keywords', (req, res) => {
  res.json(EXPANSION_KEYWORDS);
});

// Add keyword
app.post('/api/keywords', (req, res) => {
  const { keyword } = req.body;
  if (keyword && !EXPANSION_KEYWORDS.includes(keyword.toLowerCase())) {
    EXPANSION_KEYWORDS.push(keyword.toLowerCase());
  }
  res.json(EXPANSION_KEYWORDS);
});

// Remove keyword
app.delete('/api/keywords/:keyword', (req, res) => {
  const index = EXPANSION_KEYWORDS.indexOf(req.params.keyword.toLowerCase());
  if (index > -1) {
    EXPANSION_KEYWORDS.splice(index, 1);
  }
  res.json(EXPANSION_KEYWORDS);
});

// Test API connection
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('🧪 Testing Gong API connection...');
    
    const result = await gongService.getRecentCalls(null, 5); // Get just 5 calls for testing
    
    res.json({
      success: true,
      message: `Connection successful! Found ${result.calls.length} calls.`,
      totalCallsAvailable: result.totalRecords,
      sampleCall: result.calls[0] ? {
        id: result.calls[0].id,
        title: result.calls[0].title,
        started: result.calls[0].started,
        participants: result.calls[0].parties?.length || 0
      } : null
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    processedCalls: processedCalls.size,
    opportunities: opportunities.length,
    config: {
      baseURL: GONG_CONFIG.baseURL,
      hasCredentials: !!(GONG_CONFIG.accessKey && GONG_CONFIG.accessKeySecret)
    }
  });
});

// Scheduled scanning (every 2 hours during business hours, Monday-Friday)
cron.schedule('0 9-17/2 * * 1-5', async () => {
  console.log('⏰ Scheduled scan starting...');
  try {
    await gongService.scanForOpportunities();
  } catch (error) {
    console.error('❌ Scheduled scan failed:', error.message);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Gong Expansion Tracker API running on port ${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/opportunities - Get all opportunities');
  console.log('  POST /api/opportunities/:id/acknowledge - Acknowledge opportunity');
  console.log('  POST /api/scan - Manual scan trigger (body: {daysBack: 30})');
  console.log('  GET  /api/test-connection - Test Gong API connection');
  console.log('  GET  /api/keywords - Get expansion keywords');
  console.log('  POST /api/keywords - Add keyword');
  console.log('  DELETE /api/keywords/:keyword - Remove keyword');
  console.log('  GET  /api/health - Health check');
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`  Base URL: ${GONG_CONFIG.baseURL}`);
  console.log(`  Has credentials: ${!!(GONG_CONFIG.accessKey && GONG_CONFIG.accessKeySecret)}`);
  console.log('');
  console.log('💡 To test: curl http://localhost:3001/api/health');
  console.log('💡 To test connection: curl http://localhost:3001/api/test-connection');
});

module.exports = { app, gongService };