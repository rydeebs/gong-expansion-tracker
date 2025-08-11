import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Users, Calendar, ArrowRight, Filter, Settings, Bell, Play, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';

// Component for collapsible keyword categories
const KeywordCategorySection = ({ title, keywords, onRemoveKeyword, isExpanded, onToggleExpanded }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        onClick={onToggleExpanded}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {keywords.length}
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {keywords.map(keyword => (
              <span 
                key={keyword}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {keyword}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveKeyword(keyword);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Function to categorize keywords - Updated for comprehensive international focus
const categorizeKeywords = (keywords) => {
  const categories = {
    'General Expansion': ['expansion', 'upgrade', 'scale up', 'grow', 'increase capacity', 'bigger plan', 'enterprise plan', 'professional plan'],
    'International & Cross-Border': ['international', 'cross-border', 'cross border', 'global', 'worldwide', 'overseas', 'transnational', 'border crossing', 'international fulfillment', 'global shipping', 'worldwide shipping'],
    'Country-Specific Markets': ['canada', 'canadian', 'uk', 'united kingdom', 'british', 'netherlands', 'dutch', 'holland', 'australia', 'australian', 'aussie', 'european', 'eu', 'europe', 'north america', 'oceania', 'asia pacific', 'apac'],
    'Trade & Customs': ['DDP', 'DDU', 'delivered duty paid', 'delivered duty unpaid', 'incoterms', 'customs clearance', 'import duties', 'export duties', 'customs fees', 'landed cost', 'freight forwarding', 'trade compliance', 'customs compliance'],
    'Fulfillment & Warehousing': ['fulfillment', 'warehousing', 'warehouses', 'distribution', 'inventory', 'storage', 'pick and pack', 'order fulfillment', 'fulfillment centers', 'distribution centers', 'multi-country fulfillment', 'global warehousing'],
    'Shipping & Logistics': ['shipping', 'logistics', 'freight', 'express', 'expedited', 'priority', 'standard', 'economy', 'same day', 'next day', '2-day', 'air freight', 'sea freight', 'ground shipping'],
    'Currency & Payments': ['multi-currency', 'foreign exchange', 'currency conversion', 'local currency', 'international payments', 'cross-border payments', 'global payments', 'exchange rates'],
    'Technology & Integration': ['api', 'integration', 'dashboard', 'tracking', 'reporting', 'analytics', 'multi-region setup', 'global dashboard', 'international integration'],
    'Premium & Enterprise': ['enterprise', 'premium', 'advanced features', 'dedicated support', 'priority support', 'managed services', 'consulting', 'premium features', 'premium support'],
    'Supply Chain & Operations': ['supply chain', 'sourcing', 'procurement', 'suppliers', 'omnichannel', 'end-to-end', 'supply chain optimization', 'global operations', 'worldwide operations'],
    'Market Entry & Localization': ['market entry', 'new markets', 'localization', 'local market', 'regional', 'cultural adaptation', 'local partnerships', 'market penetration'],
    'Other': []
  };

  const categorized = {};
  const usedKeywords = new Set();

  // Categorize keywords
  Object.entries(categories).forEach(([category, categoryKeywords]) => {
    categorized[category] = keywords.filter(keyword => {
      const isMatch = categoryKeywords.some(catKeyword => 
        keyword.toLowerCase().includes(catKeyword.toLowerCase()) ||
        catKeyword.toLowerCase().includes(keyword.toLowerCase())
      );
      if (isMatch) usedKeywords.add(keyword);
      return isMatch;
    });
  });

  // Put uncategorized keywords in 'Other'
  categorized['Other'] = keywords.filter(keyword => !usedKeywords.has(keyword));

  // Remove empty categories
  Object.keys(categorized).forEach(category => {
    if (categorized[category].length === 0) {
      delete categorized[category];
    }
  });

  return categorized;
};

// Keyword management component
const KeywordManagementSection = ({ keywords, onAddKeyword, onRemoveKeyword }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const categorizedKeywords = categorizeKeywords(keywords);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    onAddKeyword(newKeyword.trim().toLowerCase());
    setNewKeyword('');
  };

  const expandAll = () => {
    const newState = {};
    Object.keys(categorizedKeywords).forEach(category => {
      newState[category] = true;
    });
    setExpandedCategories(newState);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Expansion Keywords</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {keywords.length} total
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAllKeywords(!showAllKeywords)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAllKeywords ? 'Show by Category' : 'Show All Keywords'}
          </button>
          {!showAllKeywords && (
            <>
              <button
                onClick={expandAll}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add new keyword section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add new expansion keyword..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <button 
            onClick={addKeyword}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Keywords display */}
      {showAllKeywords ? (
        // Show all keywords in a simple list
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <span 
              key={keyword}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              {keyword}
              <button 
                onClick={() => onRemoveKeyword(keyword)}
                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        // Show categorized keywords
        <div>
          {Object.entries(categorizedKeywords).map(([category, categoryKeywords]) => (
            <KeywordCategorySection
              key={category}
              title={category}
              keywords={categoryKeywords}
              onRemoveKeyword={onRemoveKeyword}
              isExpanded={expandedCategories[category]}
              onToggleExpanded={() => toggleCategory(category)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Scan controls component
const ScanControlsSection = ({ 
  filterStatus, 
  setFilterStatus, 
  selectedSM, 
  setSelectedSM, 
  solutionManagers, 
  triggerScan, 
  scanning, 
  lastScanResult,
  connectionStatus,
  API_BASE_URL 
}) => {
  const [scanDays, setScanDays] = useState(30);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
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

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Scan last:</label>
            <select
              value={scanDays}
              onChange={(e) => setScanDays(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
          
          <button 
            onClick={() => triggerScan(scanDays)}
            disabled={scanning}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
          >
            {scanning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{scanning ? 'Scanning...' : `Scan ${scanDays} Days`}</span>
          </button>
        </div>
      </div>
      
      {/* Connection status */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Backend Status:</span>
          {connectionStatus === 'connected' ? (
            <span className="text-green-600 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </span>
          ) : connectionStatus === 'disconnected' ? (
            <span className="text-red-600 flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Disconnected</span>
            </span>
          ) : (
            <span className="text-yellow-600 flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Checking...</span>
            </span>
          )}
        </div>
        
        <button
          onClick={() => window.open(`${API_BASE_URL}/api/test-connection`, '_blank')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Test Connection
        </button>
      </div>
      
      {lastScanResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm">
            {lastScanResult.error ? (
              <div className="text-red-600">
                <div className="font-medium">❌ Scan failed:</div>
                <div className="mt-1">{lastScanResult.error}</div>
              </div>
            ) : (
              <div className="text-green-600">
                <div className="font-medium">✅ Scan completed successfully</div>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>📞 Processed: {lastScanResult.processedCalls} calls</div>
                  <div>🚩 Found: {lastScanResult.newOpportunities} opportunities</div>
                  <div>📋 Available: {lastScanResult.totalCallsAvailable} total calls</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const GongExpansionTracker = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [solutionManagers, setSolutionManagers] = useState(["Andrew Costello", "Bryan Combest", "Dave Haran"]);
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

  const addKeyword = async (keyword) => {
    if (!keyword.trim()) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword: keyword.trim().toLowerCase() })
      });
      
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
        <ScanControlsSection
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          selectedSM={selectedSM}
          setSelectedSM={setSelectedSM}
          solutionManagers={solutionManagers}
          triggerScan={triggerScan}
          scanning={scanning}
          lastScanResult={lastScanResult}
          connectionStatus={connectionStatus}
          API_BASE_URL={API_BASE_URL}
        />

        {/* Keyword Management */}
        <KeywordManagementSection
          keywords={keywords}
          onAddKeyword={addKeyword}
          onRemoveKeyword={removeKeyword}
        />

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
                      {opportunity.callTitle && (
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Call:</span> {opportunity.callTitle}
                        </div>
                      )}
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
                      {opportunity.identificationMethod && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Identified by:</span> {opportunity.identificationMethod}
                        </div>
                      )}
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

                  {opportunity.attendees && opportunity.attendees.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Attendees:</span> {opportunity.attendees.join(', ')}
                      </div>
                    </div>
                  )}

                  {opportunity.acknowledgedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Acknowledged on {new Date(opportunity.acknowledgedAt).toLocaleDateString()} at {new Date(opportunity.acknowledgedAt).toLocaleTimeString()}
                        {opportunity.acknowledgedBy && ` by ${opportunity.acknowledgedBy}`}
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