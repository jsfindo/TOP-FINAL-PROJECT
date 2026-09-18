// services/apiServices.js
import { apiClient } from '@/lib/apiClient';

// Auth Endpoints - Login & Logout
export const loginUser = (credentials) => 
  apiClient('/api/login/user', { method: 'POST', body: credentials });

export const loginCompany = (credentials) => 
  apiClient('/api/login/company', { method: 'POST', body: credentials });

export const logout = () => 
  apiClient('/api/logout', { method: 'POST' });

// Auth Endpoints - Registration
export const registerUser = (userData) => 
  apiClient('/api/signup/user', { method: 'POST', body: userData });

export const registerCompany = (companyData) => 
  apiClient('/api/signup/company', { method: 'POST', body: companyData });

// Job Openings Endpoints
export const getOpenings = () => 
  apiClient('/api/openings');

export const createJobOpening = (data) => 
  apiClient('/api/company/createpost', { method: 'POST', body: data });

export const getCompanyOpenings = (companyId, query = '') => 
  apiClient(`/api/company/${companyId}/openings?query=${query}`);

// Application Endpoints
export const applyToJob = (openingId) => 
  apiClient('/api/applications', { method: 'POST', body: { openingId } });

export const getApplicants = (openingId) => 
  apiClient(`/api/openings/${openingId}/applicants`);