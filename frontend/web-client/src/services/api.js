import axios from 'axios';

// Configure the base axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api', // Real backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create the unified API service
export const apiService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (name, email, password, role = 'STUDENT') => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- Resume & AI endpoints ---
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await apiClient.post('/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API Error during resume upload:', error);
      throw error.response?.data || error.message;
    }
  },

  getLatestResumeAnalysis: async () => {
    try {
      const response = await apiClient.get('/resume/latest');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- Profile endpoints ---
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createProfile: async (profileData) => {
    try {
      const response = await apiClient.post('/profile/create', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/profile/update', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- Recommendations endpoint ---
  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/recommendations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLatestJobs: async () => {
    try {
      const response = await apiClient.get('/jobs/latest');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRoadmap: async (jobId) => {
    try {
      const response = await apiClient.get(`/roadmap/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateRoadmap: async ({ missingSkills, targetRole }) => {
    try {
      const response = await apiClient.post('/roadmap/generate', { missingSkills, targetRole });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getApplications: async () => {
    const res = await apiClient.get('/applications');
    return res.data;
  },

  createApplication: async (data) => {
    const res = await apiClient.post('/applications', data);
    return res.data;
  },

  updateApplication: async (id, status) => {
    const res = await apiClient.put(`/applications/${id}`, { status });
    return res.data;
  },

  deleteApplication: async (id) => {
    const res = await apiClient.delete(`/applications/${id}`);
    return res.data;
  },

  getAdminJobs: async (search = '') => {
    const res = await apiClient.get('/admin/jobs', {
      params: search ? { search } : {},
    });
    return res.data;
  },

  createAdminJob: async (payload) => {
    const res = await apiClient.post('/admin/jobs', payload);
    return res.data;
  },

  updateAdminJob: async (id, payload) => {
    const res = await apiClient.put(`/admin/jobs/${id}`, payload);
    return res.data;
  },

  deleteAdminJob: async (id) => {
    const res = await apiClient.delete(`/admin/jobs/${id}`);
    return res.data;
  },

  getAdminAnalytics: async () => {
    const res = await apiClient.get('/admin/jobs/analytics');
    return res.data;
  },

};
