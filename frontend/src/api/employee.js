import client from './client';

export const getTodayTask = () => client.get('/employee/tasks/today');
export const getMyTasks = (params) => client.get('/employee/tasks', { params });
export const completeTask = (taskId, data) => client.post(`/employee/tasks/${taskId}/complete`, data);
export const getExpHistory = (params) => client.get('/employee/exp-history', { params });
export const getPerformance = () => client.get('/employee/performance');
export const getMyRecord = () => client.get('/employee/record');
export const resign = (data = {}) => client.post('/employee/resign', data);

export default {
  getTodayTask,
  getMyTasks,
  completeTask,
  getExpHistory,
  getPerformance,
  getMyRecord,
  resign,
};
