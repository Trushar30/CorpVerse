import client from './client';

export const getTodayTask = () => client.get('/employee/tasks/today');
export const getMyTasks = (params) => client.get('/employee/tasks', { params });
export const completeTask = (taskId, data) => client.post(`/employee/tasks/${taskId}/complete`, data);
export const failTask = (data = {}) => client.post('/employee/tasks/fail', data);
export const getExpHistory = (params) => client.get('/employee/exp-history', { params });
export const getPerformance = () => client.get('/employee/performance');
export const getMyRecord = () => client.get('/employee/record');
export const resign = (data = {}) => client.post('/employee/resign', data);

// FR-16: AI Team Manager
export const getManagerProfile = () => client.get('/employee/manager');
export const requestManagerFeedback = () => client.post('/employee/manager/feedback');

// FR-17 & FR-18: Performance Reviews & Merit Raises
export const requestPerformanceReview = () => client.post('/employee/performance/review');

// FR-20: Notice Period & Resignation Flow
export const initiateNoticePeriod = (data = {}) => client.post('/employee/notice/initiate', data);
export const completeNoticeTask = (taskIndex) => client.post(`/employee/notice/complete-task/${taskIndex}`);
export const getExitCertificate = () => client.get('/employee/notice/exit-certificate');

export default {
  getTodayTask,
  getMyTasks,
  completeTask,
  failTask,
  getExpHistory,
  getPerformance,
  getMyRecord,
  resign,
  getManagerProfile,
  requestManagerFeedback,
  requestPerformanceReview,
  initiateNoticePeriod,
  completeNoticeTask,
  getExitCertificate,
};
