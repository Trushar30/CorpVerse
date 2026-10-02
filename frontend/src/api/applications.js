import api from './client';

export const getMyApplications = async () => {
  const response = await api.get('/applications/me');
  return response.data;
};

export const createApplication = async (data) => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};
