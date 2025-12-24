import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { rcaService } from '../services/api';

const CATEGORIES = ['Server', 'Database', 'Network', 'App', 'Security', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const EditRCA = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Server',
    symptoms: '',
    rootCause: '',
    solution: '',
    prevention: '',
    severity: 'Medium',
    status: 'Resolved',
    tags: ''
  });

  useEffect(() => {
    fetchRCA();
  }, [id]);

  const fetchRCA = async () => {
    try {
      setLoading(true);
      const response = await rcaService.getById(id);
      const rca = response.data;
      setFormData({
        title: rca.title || '',
        category: rca.category || 'Server',
        symptoms: rca.symptoms || '',
        rootCause: rca.rootCause || '',
        solution: rca.solution || '',
        prevention: rca.prevention || '',
        severity: rca.severity || 'Medium',
        status: rca.status || 'Resolved',
        tags: rca.tags?.join(', ') || ''
      });
    } catch (err) {
      toast.error('Failed to load RCA');
      navigate('/rcas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.symptoms || !formData.rootCause || !formData.solution) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await rcaService.update(id, submitData);
      toast.success('RCA updated successfully!');
      navigate(`/rca/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update RCA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

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

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit RCA</h1>
        <p className="text-gray-500 mt-1">Update the root cause analysis details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>

        {/* Category, Severity, Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input-field"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms <span className="text-red-500">*</span>
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            rows={4}
            className="textarea-field"
            required
          />
        </div>

        {/* Root Cause */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Root Cause <span className="text-red-500">*</span>
          </label>
          <textarea
            name="rootCause"
            value={formData.rootCause}
            onChange={handleInputChange}
            rows={4}
            className="textarea-field"
            required
          />
        </div>

        {/* Solution */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solution <span className="text-red-500">*</span>
          </label>
          <textarea
            name="solution"
            value={formData.solution}
            onChange={handleInputChange}
            rows={4}
            className="textarea-field"
            required
          />
        </div>

        {/* Prevention */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prevention Steps
          </label>
          <textarea
            name="prevention"
            value={formData.prevention}
            onChange={handleInputChange}
            rows={3}
            className="textarea-field"
          />
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
            placeholder="Comma-separated tags"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/rca/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRCA;
