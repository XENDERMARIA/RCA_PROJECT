import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  User,
  Server, 
  Database, 
  Network, 
  Monitor,
  AlertTriangle,
  FileText,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  Shield,
  Wrench,
  Target,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rcaService, aiService } from '../services/api';

const RCADetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rca, setRca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchRCA();
  }, [id]);

  const fetchRCA = async () => {
    try {
      setLoading(true);
      const response = await rcaService.getById(id);
      setRca(response.data);
    } catch (err) {
      toast.error('Failed to load RCA');
      navigate('/rcas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await rcaService.delete(id);
      toast.success('RCA deleted successfully');
      navigate('/rcas');
    } catch (err) {
      toast.error('Failed to delete RCA');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const generateSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await aiService.generateSummary(id);
      setSummary(response.data.summary);
    } catch (err) {
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Server: Server,
      Database: Database,
      Network: Network,
      App: Monitor,
      Security: AlertTriangle,
      Other: FileText
    };
    return icons[category] || FileText;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Server: 'bg-blue-100 text-blue-600',
      Database: 'bg-purple-100 text-purple-600',
      Network: 'bg-green-100 text-green-600',
      App: 'bg-orange-100 text-orange-600',
      Security: 'bg-red-100 text-red-600',
      Other: 'bg-gray-100 text-gray-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-red-100 text-red-700 border-red-200',
      High: 'bg-orange-100 text-orange-700 border-orange-200',
      Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!rca) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">RCA Not Found</h3>
        <Link to="/rcas" className="text-primary-600 hover:underline">
          Back to Knowledge Base
        </Link>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(rca.category);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-4 rounded-xl ${getCategoryColor(rca.category)}`}>
              <CategoryIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{rca.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`badge ${getCategoryColor(rca.category)}`}>
                  {rca.category}
                </span>
                <span className={`badge border ${getSeverityColor(rca.severity)}`}>
                  {rca.severity}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(rca.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {rca.createdBy && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {rca.createdBy}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Link
              to={`/rca/${id}/edit`}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {rca.tags && rca.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {rca.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Summary Section */}
      <div className="card mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Executive Summary</h3>
          </div>
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1 disabled:opacity-50"
          >
            {summaryLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{summary ? 'Regenerate' : 'Generate Summary'}</span>
              </>
            )}
          </button>
        </div>
        {summary ? (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
            <button
              onClick={() => copyToClipboard(summary)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Click "Generate Summary" to create an AI-powered executive summary of this RCA.
          </p>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Symptoms */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Symptoms</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{rca.symptoms}</p>
        </div>

        {/* Root Cause */}
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Root Cause</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{rca.rootCause}</p>
        </div>

        {/* Solution */}
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center space-x-2 mb-3">
            <Wrench className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Solution</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{rca.solution}</p>
        </div>

        {/* Prevention */}
        {rca.prevention && (
          <div className="card border-l-4 border-l-purple-500">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Prevention Steps</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{rca.prevention}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete RCA</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this RCA? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RCADetails;
