import client from './client';

export const getTrainingModules = (params = {}) => client.get('/training/modules', { params });
export const getTrainingModuleById = (id) => client.get(`/training/modules/${id}`);
export const completeTrainingModule = (id, data) => client.post(`/training/modules/${id}/complete`, data);

export default {
  getTrainingModules,
  getTrainingModuleById,
  completeTrainingModule,
};
