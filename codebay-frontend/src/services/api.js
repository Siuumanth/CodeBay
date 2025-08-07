import { API_BASE_URL } from '../config/constants';

export const createProject = async (gitURL) => {
  const response = await fetch(`${API_BASE_URL}/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gitURL }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  
  return response.json();
};