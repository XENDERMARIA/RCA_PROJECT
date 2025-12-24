import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Server, 
  Database, 
  Network, 
  Monitor,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { rcaService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await rcaService.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
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
      Critical: 'bg-red-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-green-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your Root Cause Analysis knowledge base</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center space-x-2">
          <PlusCircle className="h-5 w-5" />
          <span>Create RCA</span>
        </Link>
      </div>

      {/* Get Help CTA Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-xl">
              <HelpCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Need Help with an Issue?</h2>
              <p className="text-purple-100 mt-1">
                Describe your problem and get AI-powered solutions from our knowledge base
              </p>
            </div>
          </div>
          <Link 
            to="/solve" 
            className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            <span>Get Help Now</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total RCAs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        {stats?.byCategory?.slice(0, 3).map((cat) => {
          const Icon = getCategoryIcon(cat._id);
          return (
            <div key={cat._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{cat._id}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{cat.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${getCategoryColor(cat._id)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RCAs by Category</h3>
          <div className="space-y-3">
            {stats?.byCategory?.map((cat) => {
              const Icon = getCategoryIcon(cat._id);
              const percentage = stats.total ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div key={cat._id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(cat._id)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat._id}</span>
                      <span className="text-sm text-gray-500">{cat.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getCategoryColor(cat._id).split(' ')[0].replace('100', '500')} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Severity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RCAs by Severity</h3>
          <div className="space-y-3">
            {['Critical', 'High', 'Medium', 'Low'].map((severity) => {
              const data = stats?.bySeverity?.find(s => s._id === severity);
              const count = data?.count || 0;
              const percentage = stats?.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={severity} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{severity}</span>
                      <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getSeverityColor(severity)} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent RCAs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent RCAs</h3>
          <Link to="/rcas" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {stats?.recentRCAs?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentRCAs.map((rca) => {
              const Icon = getCategoryIcon(rca.category);
              return (
                <Link 
                  key={rca._id} 
                  to={`/rca/${rca._id}`}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className={`p-2 rounded-lg ${getCategoryColor(rca.category)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{rca.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`badge badge-${rca.category.toLowerCase()}`}>{rca.category}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(rca.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No RCAs created yet</p>
            <Link to="/create" className="text-primary-600 hover:underline mt-2 inline-block">
              Create your first RCA
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
