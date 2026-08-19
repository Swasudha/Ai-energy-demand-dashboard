import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStates = () => {
  return api.get('/api/states');
};

export const getHistorical = () => {
  return api.get('/api/historical');
};

export const getWeatherImpact = (state) => {
  return api.get('/api/weather-impact', {
    params: { state },
  });
};

export const getAnomalies = () => {
  return api.get('/api/anomalies');
};

export const getTariff = (state) => {
  return api.get(`/api/tariff/${encodeURIComponent(state)}`);
};

export const predictDemand = (data) => {
  return api.post('/api/predict', data);
};

export const runScenario = (data) => {
  return api.post('/api/scenario', data);
};

export const getCostAnalysis = (state) => {
  return api.post('/api/cost-analysis', null, {
    params: { state },
  });
};

export const getSavings = (data) => {
  return api.post('/api/savings', data);
};

export default api;