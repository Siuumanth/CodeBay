// const BASE_URL = "http://localhost:9000";
// const API_BASE_URL = "http://localhost:9000";
// const SOCKET_URL = "http://localhost:9000";

const BASE_URL = "https://codebay-1.onrender.com";
const API_BASE_URL = "https://codebay-1.onrender.com";
const SOCKET_URL = "https://codebay-1.onrender.com";


const API_ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,

  // Projects
  GET_PROJECTS: `${BASE_URL}/api/projects`,
  GET_PROJECT: (id) => `${BASE_URL}/api/projects/${id}`,
  DELETE_PROJECT: (id) => `${BASE_URL}/api/projects/${id}`,

  // Deployments
  GET_ALL_DEPLOYMENTS: `${BASE_URL}/api/deployments/getall`,
  GET_DEPLOYMENT: (id) => `${BASE_URL}/api/deployments/${id}`,

  // Deploy & Logs
  START_DEPLOY: `${BASE_URL}/api/deploy`,
  SAVE_LOGS: `${BASE_URL}/api/logs`,
};

export { BASE_URL, API_BASE_URL, SOCKET_URL, API_ENDPOINTS };
export default API_ENDPOINTS;
