import api from './client';

// ─────────────────────────────────────────────────────
// AI MANAGER & MARKETPLACE API CLIENT
// ─────────────────────────────────────────────────────

// AI Manager Telemetry
export const getTelemetry = async () => {
  const res = await api.get('/ai-manager/telemetry');
  return res.data;
};

// AI Providers
export const getProviders = async () => {
  const res = await api.get('/ai-manager/providers');
  return res.data;
};

export const createProvider = async (providerData) => {
  const res = await api.post('/ai-manager/providers', providerData);
  return res.data;
};

export const updateProvider = async (id, providerData) => {
  const res = await api.put(`/ai-manager/providers/${id}`, providerData);
  return res.data;
};

export const deleteProvider = async (id) => {
  const res = await api.delete(`/ai-manager/providers/${id}`);
  return res.data;
};

export const testProvider = async (id) => {
  const res = await api.post(`/ai-manager/providers/${id}/test`);
  return res.data;
};

// Pricing Engine Preview
export const previewPricing = async (pricingParams) => {
  const res = await api.post('/ai-manager/pricing/calculate', pricingParams);
  return res.data;
};

// Bot Workshop
export const getBots = async (params = {}) => {
  const res = await api.get('/ai-manager/bots', { params });
  return res.data;
};

export const createBot = async (botData) => {
  const res = await api.post('/ai-manager/bots', botData);
  return res.data;
};

export const updateBot = async (id, botData) => {
  const res = await api.put(`/ai-manager/bots/${id}`, botData);
  return res.data;
};

export const toggleBotStatus = async (id, status) => {
  const res = await api.patch(`/ai-manager/bots/${id}/status`, { status });
  return res.data;
};

export const testRunBot = async (id, inputPayload) => {
  const res = await api.post(`/ai-manager/bots/${id}/test-run`, { inputPayload });
  return res.data;
};

export const getPipelineRuns = async (params = {}) => {
  const res = await api.get('/ai-manager/pipeline-runs', { params });
  return res.data;
};

// Founder Marketplace Operations
export const getMarketplaceBots = async (params = {}) => {
  const res = await api.get('/marketplace/bots', { params });
  return res.data;
};

export const getBotDetails = async (id) => {
  const res = await api.get(`/marketplace/bots/${id}`);
  return res.data;
};

export const purchaseBot = async (id) => {
  const res = await api.post(`/marketplace/bots/${id}/purchase`);
  return res.data;
};

export const getMyPurchasedBots = async () => {
  const res = await api.get('/marketplace/my-bots');
  return res.data;
};

export const executeBotRun = async (id, inputPayload) => {
  const res = await api.post(`/marketplace/bots/${id}/run`, { inputPayload });
  return res.data;
};

export const getMyRuns = async () => {
  const res = await api.get('/marketplace/runs');
  return res.data;
};

// Company AI Blueprint Pipeline
export const getCompanyPipeline = () => api.get('/founder/pipeline');
export const deployCompanyPipeline = (data) => api.put('/founder/pipeline/deploy', data);
export const testCompanyPipeline = (data) => api.post('/founder/pipeline/test', data);
