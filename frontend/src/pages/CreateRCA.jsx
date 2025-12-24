import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Lightbulb,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rcaService, aiService } from '../services/api';
import AISuggestionBox from '../components/AISuggestionBox';

const CATEGORIES = ['Server', 'Database', 'Network', 'App', 'Security', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const CreateRCA = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [similarRCAs, setSimilarRCAs] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showSimilar, setShowSimilar] = useState(false);
  const [fieldSuggestion, setFieldSuggestion] = useState({ field: '', suggestion: '' });
  const [rootCauseValidation, setRootCauseValidation] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Server',
    symptoms: '',
    rootCause: '',
    solution: '',
    prevention: '',
    severity: 'Medium',
    tags: ''
  });

  // Debounced search for similar RCAs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 5 || formData.symptoms.length > 10) {
        findSimilarRCAs();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.title, formData.symptoms]);

  const findSimilarRCAs = async () => {
    if (!formData.title && !formData.symptoms) return;
    
    try {
      setAiLoading(true);
      const response = await aiService.findSimilar(formData.title, formData.symptoms);
      setSimilarRCAs(response.data.similarRCAs || []);
      setAiSuggestion(response.data.aiSuggestion || '');
      if (response.data.similarRCAs?.length > 0 || response.data.aiSuggestion) {
        setShowSimilar(true);
      }
    } catch (err) {
      console.error('Failed to find similar RCAs:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field suggestion when user types
    if (fieldSuggestion.field === name) {
      setFieldSuggestion({ field: '', suggestion: '' });
    }
    
    // Clear root cause validation when editing root cause
    if (name === 'rootCause') {
      setRootCauseValidation(null);
    }
  };

  const getAIAssistance = async (field) => {
    const value = formData[field];
    if (!value) {
      toast.error(`Please enter some ${field} first`);
      return;
    }

    try {
      setAiLoading(true);
      const context = field === 'rootCause' ? formData.symptoms : 
                     field === 'solution' ? formData.rootCause :
                     field === 'prevention' ? formData.rootCause : '';
      
      const response = await aiService.assist(field, value, context);
      setFieldSuggestion({
        field,
        suggestion: response.data.suggestion
      });
    } catch (err) {
      toast.error('Failed to get AI assistance');
    } finally {
      setAiLoading(false);
    }
  };

  const validateRootCause = async () => {
    if (!formData.rootCause) {
      toast.error('Please enter a root cause first');
      return;
    }

    try {
      setAiLoading(true);
      const response = await aiService.validateRootCause(formData.rootCause, formData.symptoms);
      setRootCauseValidation(response.data);
    } catch (err) {
      toast.error('Failed to validate root cause');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.symptoms || !formData.rootCause || !formData.solution) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await rcaService.create(submitData);
      toast.success('RCA created successfully!');
      navigate('/rcas');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create RCA');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (text, field) => {
    // This is a simple example - in real use, you'd parse the AI suggestion
    toast.success('Review the suggestion and update your content');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New RCA</h1>
        <p className="text-gray-500 mt-1">Document a root cause analysis with AI-assisted suggestions</p>
      </div>

      {/* AI Similar RCAs Panel */}
      {showSimilar && (similarRCAs.length > 0 || aiSuggestion) && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Found Similar Issues</h3>
              {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
            </div>
            <button 
              onClick={() => setShowSimilar(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {similarRCAs.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Past RCAs that might be related:</p>
              <div className="space-y-2">
                {similarRCAs.slice(0, 3).map((rca) => (
                  <div 
                    key={rca._id} 
                    className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:border-primary-300"
                    onClick={() => navigate(`/rca/${rca._id}`)}
                  >
                    <p className="font-medium text-gray-900 text-sm">{rca.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{rca.rootCause}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {aiSuggestion && (
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">AI Analysis:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{aiSuggestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => getAIAssistance('title')}
              disabled={aiLoading || !formData.title}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>Improve with AI</span>
            </button>
          </div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Production server down after deployment"
            className="input-field"
            required
          />
          {fieldSuggestion.field === 'title' && (
            <AISuggestionBox 
              suggestion={fieldSuggestion.suggestion} 
              onClose={() => setFieldSuggestion({ field: '', suggestion: '' })}
            />
          )}
        </div>

        {/* Category and Severity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              className="input-field"
            >
              {SEVERITIES.map(sev => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => getAIAssistance('symptoms')}
              disabled={aiLoading || !formData.symptoms}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>Improve with AI</span>
            </button>
          </div>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            placeholder="Describe what was observed. e.g., Error 500 responses, high latency, failed health checks..."
            rows={4}
            className="textarea-field"
            required
          />
          {fieldSuggestion.field === 'symptoms' && (
            <AISuggestionBox 
              suggestion={fieldSuggestion.suggestion} 
              onClose={() => setFieldSuggestion({ field: '', suggestion: '' })}
            />
          )}
        </div>

        {/* Root Cause */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Root Cause <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={validateRootCause}
                disabled={aiLoading || !formData.rootCause}
                className="text-xs text-orange-600 hover:text-orange-700 flex items-center space-x-1 disabled:opacity-50"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Validate</span>
              </button>
              <button
                type="button"
                onClick={() => getAIAssistance('rootCause')}
                disabled={aiLoading || !formData.rootCause}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                <span>Improve with AI</span>
              </button>
            </div>
          </div>
          <textarea
            name="rootCause"
            value={formData.rootCause}
            onChange={handleInputChange}
            placeholder="What was the underlying reason? e.g., Memory leak in the authentication service caused by unclosed connections..."
            rows={4}
            className="textarea-field"
            required
          />
          
          {/* Root Cause Validation Result */}
          {rootCauseValidation && (
            <div className={`mt-3 p-3 rounded-lg ${rootCauseValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-start space-x-2">
                {rootCauseValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${rootCauseValidation.isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                    {rootCauseValidation.isValid ? 'Looks like a valid root cause!' : 'This might be a symptom, not a root cause'}
                  </p>
                  {rootCauseValidation.analysis && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{rootCauseValidation.analysis}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {fieldSuggestion.field === 'rootCause' && (
            <AISuggestionBox 
              suggestion={fieldSuggestion.suggestion} 
              onClose={() => setFieldSuggestion({ field: '', suggestion: '' })}
            />
          )}
        </div>

        {/* Solution */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Solution <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => getAIAssistance('solution')}
              disabled={aiLoading || !formData.solution}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>Improve with AI</span>
            </button>
          </div>
          <textarea
            name="solution"
            value={formData.solution}
            onChange={handleInputChange}
            placeholder="How was the issue resolved? Include step-by-step actions taken..."
            rows={4}
            className="textarea-field"
            required
          />
          {fieldSuggestion.field === 'solution' && (
            <AISuggestionBox 
              suggestion={fieldSuggestion.suggestion} 
              onClose={() => setFieldSuggestion({ field: '', suggestion: '' })}
            />
          )}
        </div>

        {/* Prevention */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Prevention Steps
            </label>
            <button
              type="button"
              onClick={() => getAIAssistance('prevention')}
              disabled={aiLoading || !formData.prevention}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>Improve with AI</span>
            </button>
          </div>
          <textarea
            name="prevention"
            value={formData.prevention}
            onChange={handleInputChange}
            placeholder="What measures will prevent this from happening again? e.g., Added monitoring, updated runbooks..."
            rows={3}
            className="textarea-field"
          />
          {fieldSuggestion.field === 'prevention' && (
            <AISuggestionBox 
              suggestion={fieldSuggestion.suggestion} 
              onClose={() => setFieldSuggestion({ field: '', suggestion: '' })}
            />
          )}
        </div>

        {/* Tags */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Comma-separated tags: e.g., kubernetes, memory-leak, production"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/rcas')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save RCA</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRCA;
