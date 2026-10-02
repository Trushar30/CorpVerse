import client from './client';

export const startInterview = (applicationId) =>
  client.post(`/interviews/${applicationId}/start`);

export const sendInterviewMessage = (applicationId, message) =>
  client.post(`/interviews/${applicationId}/message`, { message });

export const getInterviewResult = (applicationId) =>
  client.get(`/interviews/${applicationId}/result`);
