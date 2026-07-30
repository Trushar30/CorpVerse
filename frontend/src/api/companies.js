import api from './client';

export const getCompanies = async (params = {}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const getCompanyRoles = async (id) => {
  const response = await api.get(`/companies/${id}/roles`);
  return response.data;
};

export const getDomains = async () => {
  const response = await api.get('/domains');
  return response.data;
};

