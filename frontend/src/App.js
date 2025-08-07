import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Users, Calendar, ArrowRight, Filter, Settings, Bell, Play } from 'lucide-react';

const GongExpansionTracker = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [solutionManagers, setSolutionManagers] = useState(["Andrew Costello", "Bryan Combest", "Dave Haran"]);
  const [newKeyword, setNewKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSM, setSelectedSM] = useState('all');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Load data on component mount
  useEffect(() => {
    loadOpportunities();
    loadKeywords();
    loadSolutionManagers();
    checkConnection();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, filterStatus, selectedSM]);

  // Check backend connection
  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      setConnectionStatus(data.status === 'healthy' ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Backend connection failed:', error);
    }
  };

  // Load opportunities from backend
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/opportunities`);
      const data = await response.json();
      setOpportunities(data);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Load keywords from backend
  const loadKeywords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords`);
      const data = await response.json();
      setKeywords(data);
    } catch (error) {
      console.error('Failed to load keywords:', error);
    }
  };

  // Load solution managers from backend
  const loadSolutionManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/solution-managers`);
      const data = await response.json();
      setSolutionManagers(data);
    } catch (error) {
      console.error('Failed to load solution managers:', error);
      // Keep default list if API fails
    }
  };

  // Trigger manual scan
  const triggerScan = async (daysBack = 30) => {
    setScanning(true);
    setLastScanResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ daysBack })
      });
      
      const result = await response.json();
      setLastScanResult(result);
      
      // Reload opportunities after scan
      await loadOpportunities();
    } catch (error) {
      console.error('Scan failed:', error);
      setLastScanResult({ error: error.message });
    } finally {
      setScanning(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(opp => opp.status === filterStatus);
    }
    
    if (selectedSM !== 'all') {
      filtered = filtered.filter(opp => opp.assignedSM === selectedSM);
    }
    
    setFilteredOpportunities(filtered);
  };

  const acknowledgeOpportunity = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/opportunities/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acknowledgedBy: 'User' })
      });
      
      // Reload opportunities
      await loadOpportunities();
    } catch (error) {
      console.error('Failed to acknowledge opportunity:', error);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword: newKeyword.trim().toLowerCase() })
      });
      
      setNewKeyword('');
      await loadKeywords();
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  };

  const removeKeyword = async (keyword) => {
    try {
      await fetch(`${API_BASE_URL}/api/keywords/${encodeURIComponent(keyword)}`, {
        method: 'DELETE'
      });
      
      await loadKeywords();
    } catch (error) {
      console.error('Failed to remove keyword:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-red-600 bg-red-100';
    if (score >= 7) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === 'pending') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-green-100 text-green-800`;
  };

  const getConnectionBadge = () => {
    if (connectionStatus === 'connected') {
      return <span className="text-green-600 text-sm">● Connected</span>;
    } else if (connectionStatus === 'disconnected') {
      return <span className="text-red-600 text-sm">● Disconnected</span>;
    }
    return <span className="text-gray-600 text-sm">● Checking...</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Expansion Opportunity Tracker</h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <span>Powered by</span>
                  <span className="font-medium text-gray-900">Gong API</span>
                </div>
                {getConnectionBadge()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {filteredOpportunities.filter(o => o.status === 'pending').length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
              <button 
                onClick={checkConnection}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {opportunities.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {opportunities.filter(o => o.status === 'acknowledged').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Keywords</p>
                <p className="text-2xl font-semibold text-gray-900">{keywords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Found</p>
                <p className="text-2xl font-semibold text-gray-900">{opportunities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Solution Manager:</label>
                <select 
                  value={selectedSM} 
                  onChange={(e) => setSelectedSM(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">All SMs</option>
                  {solutionManagers.map(sm => (
                    <option key={sm} value={sm}>{sm}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => triggerScan(30)}
                disabled={scanning}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {scanning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{scanning ? 'Scanning...' : 'Scan Calls'}</span>
              </button>
            </div>
          </div>
          
          {lastScanResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                {lastScanResult.error ? (
                  <p className="text-red-600">❌ Scan failed: {lastScanResult.error}</p>
                ) : (
                  <p className="text-green-600">
                    ✅ Scan complete: Processed {lastScanResult.processedCalls} calls, 
                    found {lastScanResult.newOpportunities} new opportunities
                    {lastScanResult.totalCallsAvailable && (
                      <span className="text-gray-600"> (Total calls available: {lastScanResult.totalCallsAvailable})</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Keyword Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expansion Keywords</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map(keyword => (
              <span 
                key={keyword}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {keyword}
                <button 
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add new keyword..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 max-w-xs"
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <button 
              onClick={addKeyword}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {opportunities.length === 0 
                  ? "No expansion opportunities found. Try running a scan to analyze recent calls." 
                  : "No expansion opportunities match your current filters."
                }
              </p>
              {opportunities.length === 0 && (
                <button
                  onClick={() => triggerScan(30)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Scan Last 30 Days
                </button>
              )}
            </div>
          ) : (
            filteredOpportunities.map(opportunity => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{opportunity.merchant}</h3>
                        <span className={getStatusBadge(opportunity.status)}>
                          {opportunity.status}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(opportunity.opportunityScore)}`}>
                          Score: {opportunity.opportunityScore}/10
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>📞 {opportunity.callDate} • {opportunity.callDuration}</span>
                        <span>👤 MSM: {opportunity.msm}</span>
                        <span>🎯 SM: {opportunity.assignedSM}</span>
                      </div>
                    </div>
                    {opportunity.status === 'pending' && (
                      <button
                        onClick={() => acknowledgeOpportunity(opportunity.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Conversation Excerpt:</h4>
                    <p className="text-sm text-gray-600 italic">"{opportunity.transcript}"</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Detected Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opportunity.detectedKeywords.map(keyword => (
                            <span key={keyword} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a 
                        href={opportunity.callRecordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>View Recording</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {opportunity.acknowledgedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Acknowledged on {new Date(opportunity.acknowledgedAt).toLocaleDateString()} at {new Date(opportunity.acknowledgedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GongExpansionTracker;
