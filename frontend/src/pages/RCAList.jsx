import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Server, 
  Database, 
  Network, 
  Monitor,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { rcaService } from '../services/api';

const CATEGORIES = ['All', 'Server', 'Database', 'Network', 'App', 'Security', 'Other'];
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

const RCAList = () => {
  const [rcas, setRcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      searchRCAs();
    } else {
      fetchRCAs();
    }
  }, [selectedCategory, selectedSeverity, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchRCAs();
      } else {
        fetchRCAs();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRCAs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10
      };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedSeverity !== 'All') params.severity = selectedSeverity;

      const response = await rcaService.getAll(params);
      setRcas(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch RCAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchRCAs = async () => {
    try {
      setIsSearching(true);
      const category = selectedCategory !== 'All' ? selectedCategory : '';
      const response = await rcaService.search(searchQuery, category);
      setRcas(response.data);
      setPagination({ page: 1, pages: 1, total: response.count });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
      setLoading(false);
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
      Server: 'bg-blue-100 text-blue-600 border-blue-200',
      Database: 'bg-purple-100 text-purple-600 border-purple-200',
      Network: 'bg-green-100 text-green-600 border-green-200',
      App: 'bg-orange-100 text-orange-600 border-orange-200',
      Security: 'bg-red-100 text-red-600 border-red-200',
      Other: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-red-100 text-red-700',
      High: 'bg-orange-100 text-orange-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-green-100 text-green-700'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSeverity('All');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedSeverity !== 'All';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Search and browse all documented RCAs</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New RCA</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, symptoms, root cause, solution..."
              className="input-field pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600 animate-spin" />
            )}
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input-field"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input-field"
            >
              {SEVERITIES.map(sev => (
                <option key={sev} value={sev}>{sev === 'All' ? 'All Severities' : sev}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Found {pagination.total} RCA{pagination.total !== 1 ? 's' : ''}
          {hasActiveFilters && ' matching your filters'}
        </div>
      </div>

      {/* RCA List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : rcas.length > 0 ? (
        <div className="space-y-4">
          {rcas.map((rca) => {
            const Icon = getCategoryIcon(rca.category);
            return (
              <Link
                key={rca._id}
                to={`/rca/${rca._id}`}
                className="card block hover:shadow-md transition-shadow duration-200 hover:border-primary-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Category Icon */}
                  <div className={`p-3 rounded-lg border ${getCategoryColor(rca.category)}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {rca.title}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`badge ${getCategoryColor(rca.category)}`}>
                            {rca.category}
                          </span>
                          <span className={`badge ${getSeverityColor(rca.severity)}`}>
                            {rca.severity}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(rca.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      <span className="font-medium">Root Cause:</span> {rca.rootCause}
                    </p>

                    {rca.tags && rca.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rca.tags.slice(0, 4).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {rca.tags.length > 4 && (
                          <span className="text-xs text-gray-400">+{rca.tags.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RCAs Found</h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search or filters'
              : 'Start documenting your root cause analyses'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          ) : (
            <Link to="/create" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create First RCA</span>
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RCAList;
