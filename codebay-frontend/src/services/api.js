import { API_BASE_URL } from '../config/constants';

export const createProject = async (gitURL, envVars = []) => {
  // Filter out empty environment variables
  const filteredEnvVars = envVars.filter(env => env.key.trim() && env.value.trim());
  
  const response = await fetch(`${API_BASE_URL}/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      gitURL,
      envVars: filteredEnvVars 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  
  return response.json();
};
