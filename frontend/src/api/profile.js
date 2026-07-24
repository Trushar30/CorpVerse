import api from './client';

export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const completeProfile = async (data) => {
  const response = await api.post('/profile/complete', data);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/profile', data);
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
