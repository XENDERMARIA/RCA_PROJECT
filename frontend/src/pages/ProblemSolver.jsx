import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Send, 
  Sparkles, 
  Loader2, 
  MessageCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Server,
  Database,
  Network,
  Monitor,
  Shield,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { solverService } from '../services/api';

const CATEGORIES = ['All', 'Server', 'Database', 'Network', 'App', 'Security', 'Other'];

const ProblemSolver = () => {
  const [mode, setMode] = useState('search'); // 'search' or 'chat'
  const [problem, setProblem] = useState('');
  const [category, setCategory] = useState('All');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedRCA, setSelectedRCA] = useState(null);
  const [guidedHelp, setGuidedHelp] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ helpful: null, solution: '' });
  
  // Chat mode state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Autocomplete as user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (problem.length >= 3 && mode === 'search') {
        try {
          const response = await solverService.getSuggestions(problem);
          setSuggestions(response.data || []);
          setShowSuggestions(response.data?.length > 0);
        } catch (err) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [problem, mode]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!problem.trim()) {
      toast.error('Please describe your problem');
      return;
    }

    try {
      setLoading(true);
      setShowSuggestions(false);
      const response = await solverService.searchSolutions(
        problem, 
        category !== 'All' ? category : '',
        additionalDetails
      );
      setResults(response.data);
      setSelectedRCA(null);
      setGuidedHelp(null);
      setShowFeedback(false);
    } catch (err) {
      toast.error('Failed to search for solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleGetGuidedHelp = async (rca) => {
    try {
      setLoading(true);
      setSelectedRCA(rca);
      const response = await solverService.getGuidedHelp(rca._id, problem, additionalDetails);
      setGuidedHelp(response.data.guidance);
    } catch (err) {
      toast.error('Failed to get guided help');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText) return;

    const newMessage = { role: 'user', content: messageText };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setChatInput('');

    try {
      setLoading(true);
      
      // Only send user and assistant messages to API (filter out system messages)
      const messagesToSend = updatedMessages.filter(m => 
        m.role === 'user' || m.role === 'assistant'
      );
      
      const response = await solverService.chat(messagesToSend);
      
      if (response.success) {
        setMessages([
          ...updatedMessages,
          { 
            role: 'assistant', 
            content: response.data.response, 
            relevantRCAs: response.data.relevantRCAs 
          }
        ]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get response';
      toast.error(errorMessage);
      
      // Add error message to chat so user can see what happened
      setMessages([
        ...updatedMessages,
        { 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease try again or describe your problem differently.`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful) => {
    setFeedbackData(prev => ({ ...prev, helpful }));
    if (!helpful) {
      setShowFeedback(true);
    } else {
      // Submit positive feedback
      try {
        await solverService.submitFeedback({
          rcaId: selectedRCA?._id,
          helpful: true
        });
        toast.success('Thanks for your feedback!');
      } catch (err) {
        console.error('Feedback error:', err);
      }
    }
  };

  const handleCreateRCAFromSolution = async () => {
    if (!feedbackData.solution.trim()) {
      toast.error('Please describe how you solved the problem');
      return;
    }

    try {
      setLoading(true);
      const response = await solverService.submitFeedback({
        helpful: false,
        problemDescription: problem,
        actualSolution: feedbackData.solution,
        createNewRCA: true
      });
      
      toast.success('New RCA created from your solution!');
      setShowFeedback(false);
      setFeedbackData({ helpful: null, solution: '' });
    } catch (err) {
      toast.error('Failed to create RCA');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    // Start with empty messages - the first user message will trigger the conversation
    setMessages([]);
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      Server: Server,
      Database: Database,
      Network: Network,
      App: Monitor,
      Security: Shield,
      Other: FileText
    };
    return icons[cat] || FileText;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Problem Solver</h1>
        <p className="text-gray-500 mt-2">
          Describe your issue and get AI-powered solutions from our knowledge base
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => { setMode('search'); setResults(null); setMessages([]); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'search' 
                ? 'bg-white shadow text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Quick Search
          </button>
          <button
            onClick={() => { setMode('chat'); setMessages([]); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'chat' 
                ? 'bg-white shadow text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Chat Assistant
          </button>
        </div>
      </div>

      {/* Search Mode */}
      {mode === 'search' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="card">
            <form onSubmit={handleSearch}>
              <div className="space-y-4">
                {/* Problem Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What problem are you experiencing?
                  </label>
                  <div className="relative">
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="e.g., Database connection timeout, Server returning 502 errors, Application crashing on startup..."
                      rows={3}
                      className="textarea-field pr-12"
                    />
                    <Sparkles className="absolute right-3 top-3 h-5 w-5 text-purple-400" />
                  </div>
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <p className="px-3 py-2 text-xs text-gray-500 border-b">Similar issues found:</p>
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setProblem(s.title);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-500 truncate">{s.preview}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category and Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category (optional)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional details (optional)
                    </label>
                    <input
                      type="text"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder="Error codes, recent changes, environment..."
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading || !problem.trim()}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Searching knowledge base...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Find Solutions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Confidence Indicator */}
              <div className={`card border-l-4 ${
                results.confidence === 'high' ? 'border-l-green-500 bg-green-50' :
                results.confidence === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-gray-500 bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  {results.confidence === 'high' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : results.confidence === 'medium' ? (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <HelpCircle className="h-6 w-6 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {results.confidence === 'high' ? 'High confidence match found!' :
                       results.confidence === 'medium' ? 'Possible matches found' :
                       'No direct matches, but here\'s some guidance'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Found {results.totalMatches} related issue(s) in the knowledge base
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {results.aiAnalysis && (
                <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Analysis & Recommendations</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {results.aiAnalysis}
                  </div>
                </div>
              )}

              {/* Matched RCAs */}
              {results.matchedRCAs && results.matchedRCAs.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                    Related Past Incidents
                  </h3>
                  <div className="space-y-3">
                    {results.matchedRCAs.map((rca) => {
                      const Icon = getCategoryIcon(rca.category);
                      const isSelected = selectedRCA?._id === rca._id;
                      
                      return (
                        <div key={rca._id} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setSelectedRCA(isSelected ? null : rca)}
                            className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Icon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{rca.title}</p>
                                <p className="text-sm text-gray-500">{rca.category} • {rca.severity}</p>
                              </div>
                            </div>
                            {isSelected ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                          
                          {isSelected && (
                            <div className="p-4 bg-gray-50 border-t">
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="font-medium text-gray-700">Symptoms:</p>
                                  <p className="text-gray-600">{rca.symptoms}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Root Cause:</p>
                                  <p className="text-gray-600">{rca.rootCause}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Solution:</p>
                                  <p className="text-gray-600">{rca.solution}</p>
                                </div>
                                {rca.prevention && (
                                  <div>
                                    <p className="font-medium text-gray-700">Prevention:</p>
                                    <p className="text-gray-600">{rca.prevention}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-3 mt-4 pt-4 border-t">
                                <button
                                  onClick={() => handleGetGuidedHelp(rca)}
                                  disabled={loading}
                                  className="btn-primary text-sm flex items-center space-x-1"
                                >
                                  <Lightbulb className="h-4 w-4" />
                                  <span>Get Step-by-Step Guide</span>
                                </button>
                                <Link
                                  to={`/rca/${rca._id}`}
                                  className="btn-secondary text-sm flex items-center space-x-1"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  <span>View Full RCA</span>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guided Help */}
              {guidedHelp && (
                <div className="card border-2 border-green-200 bg-green-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Step-by-Step Solution Guide</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-lg">
                    {guidedHelp}
                  </div>
                  
                  {/* Feedback Section */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-gray-700 mb-3">Did this solve your problem?</p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleFeedback(true)}
                        className="btn-primary text-sm flex items-center space-x-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Yes, it helped!</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>No, I found a different solution</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Create New RCA from User's Solution */}
              {showFeedback && (
                <div className="card border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Share Your Solution</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Help others by sharing what actually solved your problem. This will be added to our knowledge base!
                  </p>
                  <textarea
                    value={feedbackData.solution}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, solution: e.target.value }))}
                    placeholder="Describe how you solved the problem... Include steps, commands, or configurations that worked."
                    rows={4}
                    className="textarea-field mb-4"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCreateRCAFromSolution}
                      disabled={loading || !feedbackData.solution.trim()}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span>Add to Knowledge Base</span>
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="btn-secondary"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* No Matches - Create RCA */}
              {results.matchedRCAs?.length === 0 && (
                <div className="card text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    This looks like a new issue
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Once you solve it, please create an RCA to help others in the future!
                  </p>
                  <Link to="/create" className="btn-primary inline-flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Create New RCA</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Mode */}
      {mode === 'chat' && (
        <div className="card h-[600px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              // Welcome screen when no messages
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full mb-4">
                  <MessageCircle className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chat with RCA Bot
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  I'm your friendly IT support assistant. Just say hi or describe your problem and I'll help you troubleshoot!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Hello!', 'I have a database issue', 'Server is down', 'Need help troubleshooting'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setChatInput(suggestion);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat messages
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : msg.isError 
                            ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' && !msg.isError && (
                        <div className="flex items-center space-x-2 mb-2 text-purple-600">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-medium">RCA Bot</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      
                      {/* Show relevant RCAs if any */}
                      {msg.relevantRCAs && msg.relevantRCAs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">📚 Related past issues:</p>
                          {msg.relevantRCAs.map((rca) => (
                            <Link
                              key={rca._id}
                              to={`/rca/${rca._id}`}
                              className="block text-xs bg-white rounded p-2 mb-1 hover:bg-gray-50 border border-gray-100"
                            >
                              <span className="font-medium text-primary-700">{rca.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">RCA Bot is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendChat} className="flex space-x-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={messages.length === 0 ? "Say hello or describe your problem..." : "Type your message..."}
                className="flex-1 input-field"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !chatInput.trim()}
                className="btn-primary px-4"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Tip: Describe your problem in detail for better solutions
            </p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Be Specific</h4>
          </div>
          <p className="text-sm text-gray-600">
            Include error messages, affected systems, and when the issue started for better matches.
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">Try Different Terms</h4>
          </div>
          <p className="text-sm text-gray-600">
            If you don't find matches, try describing the symptoms differently or use technical terms.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Plus className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Share Solutions</h4>
          </div>
          <p className="text-sm text-gray-600">
            Found a fix? Add it to the knowledge base so others can benefit from your experience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;
