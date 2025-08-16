import { API_ENDPOINTS } from '../config/constants';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
/*
// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
*/

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};


// Auth API functions
export const register = async (userData) => {
  const response = await fetch(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

export const login = async (credentials) => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

// Projects API functions
export const getProjects = async () => {
  const response = await fetch(API_ENDPOINTS.GET_PROJECTS, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

export const getProject = async (id) => {
  const response = await fetch(API_ENDPOINTS.GET_PROJECT(id), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

export const deleteProject = async (id) => {
  const response = await fetch(API_ENDPOINTS.DELETE_PROJECT(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

// Deployments API functions
export const getDeployments = async () => {
  const response = await fetch(API_ENDPOINTS.GET_ALL_DEPLOYMENTS, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

export const getDeployment = async (id) => {
  const response = await fetch(API_ENDPOINTS.GET_DEPLOYMENT(id), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

// Deploy API function
export const startDeploy = async (deployData) => {
  const response = await fetch(API_ENDPOINTS.START_DEPLOY, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(deployData),
  });
  
  return handleResponse(response);
};

// Logs API function
export const saveLogs = async (deploymentId, logs) => {
  const response = await fetch(API_ENDPOINTS.SAVE_LOGS, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ deploymentId, logs }),
  });
  
  return handleResponse(response);
};
