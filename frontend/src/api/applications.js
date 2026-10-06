import api from './client';

export const getMyApplications = async (params) => {
  const response = await api.get('/applications/me', { params });
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

export const acceptOffer = async (id) => {
  const response = await api.post(`/applications/${id}/accept-offer`);
  return response.data;
};

export const declineOffer = async (id) => {
  const response = await api.post(`/applications/${id}/decline-offer`);
  return response.data;
};

export const negotiateOffer = async (id, data) => {
  const response = await api.post(`/applications/${id}/negotiate`, data);
  return response.data;
};

export default {
  getMyApplications,
  createApplication,
  getApplicationById,
  acceptOffer,
  declineOffer,
  negotiateOffer,
};
