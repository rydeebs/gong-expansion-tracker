import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Users, Calendar, ArrowRight, Filter, Settings, Bell } from 'lucide-react';

const GongExpansionTracker = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [keywords, setKeywords] = useState([
    'expansion', 'international', 'DDP', 'DDU', 'international markets',
    'cross border', 'UK Fulfillment', 'Netherlands Fulfillment', 'Canada Fulfillment', 'Australia Fulfillment'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSM, setSelectedSM] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - in real implementation, this would come from Gong API
  const mockOpportunities = [
    {
      id: 1,
      merchant: "TechCorp Solutions",
      merchantId: "TECH-001",
      callDate: "2025-08-03",
      callDuration: "45 mins",
      msm: "Sarah Johnson",
      msmEmail: "sarah.j@company.com",
      assignedSM: "Mike Chen",
      smEmail: "mike.c@company.com",
      transcript: "We've been growing rapidly and our current plan is getting tight. We might need to look at upgrading to support more users and additional features.",
      detectedKeywords: ["upgrading", "more users", "additional features"],
      opportunityScore: 8.5,
      status: "pending",
      callRecordingUrl: "https://gong.io/call/12345",
      attendees: ["Sarah Johnson (MSM)", "John Smith (Merchant)", "Lisa Wong (Merchant)"],
      smPresent: false,
      flaggedAt: "2025-08-03T10:30:00Z"
    },
    {
      id: 2,
      merchant: "GrowthStart Inc",
      merchantId: "GROW-002",
      callDate: "2025-08-02",
      callDuration: "32 mins",
      msm: "David Liu",
      msmEmail: "david.l@company.com",
      assignedSM: "Emma Rodriguez",
      smEmail: "emma.r@company.com",
      transcript: "Our team is expanding and we're hitting the limits of our current subscription. We're interested in enterprise features and need to scale up significantly.",
      detectedKeywords: ["enterprise features", "scale up", "expanding"],
      opportunityScore: 9.2,
      status: "acknowledged",
      callRecordingUrl: "https://gong.io/call/12346",
      attendees: ["David Liu (MSM)", "Alex Chen (Merchant)", "Sarah Park (Merchant)"],
      smPresent: false,
      flaggedAt: "2025-08-02T14:15:00Z",
      acknowledgedAt: "2025-08-02T16:45:00Z"
    },
    {
      id: 3,
      merchant: "Enterprise Dynamics",
      merchantId: "ENT-003",
      callDate: "2025-08-01",
      callDuration: "28 mins",
      msm: "Rachel Green",
      msmEmail: "rachel.g@company.com",
      assignedSM: "Tom Wilson",
      smEmail: "tom.w@company.com",
      transcript: "We love the platform but we're looking at add-on modules and premium support options. Our usage has tripled since we started.",
      detectedKeywords: ["add-on", "premium", "tripled"],
      opportunityScore: 7.8,
      status: "pending",
      callRecordingUrl: "https://gong.io/call/12347",
      attendees: ["Rachel Green (MSM)", "Michael Johnson (Merchant)"],
      smPresent: false,
      flaggedAt: "2025-08-01T11:20:00Z"
    }
  ];

  const solutionManagers = [
    "Mike Chen", "Emma Rodriguez", "Tom Wilson", "Jessica Lee", "Ryan Davis"
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setOpportunities(mockOpportunities);
      setFilteredOpportunities(mockOpportunities);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, filterStatus, selectedSM]);

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

  const acknowledgeOpportunity = (id) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id 
          ? { ...opp, status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
          : opp
      )
    );
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords(prev => [...prev, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
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
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>Powered by</span>
                <span className="font-medium text-gray-900">Gong API</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {filteredOpportunities.filter(o => o.status === 'pending').length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900">
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
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{opportunities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
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

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Scan New Calls
            </button>
          </div>
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
              <p className="mt-4 text-gray-600">Scanning Gong recordings...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expansion opportunities found with current filters.</p>
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