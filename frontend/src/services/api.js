import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// RCA API calls
export const rcaService = {
  // Get all RCAs with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/rca', { params });
    return response.data;
  },

  // Get single RCA by ID
  getById: async (id) => {
    const response = await api.get(`/rca/${id}`);
    return response.data;
  },

  // Create new RCA
  create: async (rcaData) => {
    const response = await api.post('/rca', rcaData);
    return response.data;
  },

  // Update RCA
  update: async (id, rcaData) => {
    const response = await api.put(`/rca/${id}`, rcaData);
    return response.data;
  },

  // Delete RCA
  delete: async (id) => {
    const response = await api.delete(`/rca/${id}`);
    return response.data;
  },

  // Search RCAs
  search: async (query, category = '') => {
    const params = { q: query };
    if (category) params.category = category;
    const response = await api.get('/rca/search', { params });
    return response.data;
  },

  // Get RCA statistics
  getStats: async () => {
    const response = await api.get('/rca/stats');
    return response.data;
  }
};

// AI API calls
export const aiService = {
  // Find similar RCAs based on title and symptoms
  findSimilar: async (title, symptoms) => {
    const response = await api.post('/ai/similarity', { title, symptoms });
    return response.data;
  },

  // Get AI assistance for a specific field
  assist: async (field, value, context = '') => {
    const response = await api.post('/ai/assist', { field, value, context });
    return response.data;
  },

  // Validate if root cause looks like a symptom
  validateRootCause: async (rootCause, symptoms) => {
    const response = await api.post('/ai/validate-rootcause', { rootCause, symptoms });
    return response.data;
  },

  // Generate summary for an RCA
  generateSummary: async (rcaId) => {
    const response = await api.post('/ai/summarize', { rcaId });
    return response.data;
  }
};

// Problem Solver API calls
export const solverService = {
  // Search for solutions based on problem description
  searchSolutions: async (problem, category = '', additionalDetails = '') => {
    const response = await api.post('/solver/search', { problem, category, additionalDetails });
    return response.data;
  },

  // Get guided help for a specific RCA
  getGuidedHelp: async (rcaId, userProblem, userContext = '') => {
    const response = await api.post('/solver/guide', { rcaId, userProblem, userContext });
    return response.data;
  },

  // Chat-based diagnosis
  chat: async (messages, context = '') => {
    const response = await api.post('/solver/chat', { messages, context });
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (data) => {
    const response = await api.post('/solver/feedback', data);
    return response.data;
  },

  // Get autocomplete suggestions
  getSuggestions: async (query) => {
    const response = await api.get('/solver/suggest', { params: { q: query } });
    return response.data;
  }
};

export default api;
