import client from './client';

const InvestmentAPI = {
  invest: (fundId, amount, mode = 'lumpsum', sipDay = null) =>
    client.post('/investments', { fundId, amount, mode, sipDay }),

  getPortfolio: () =>
    client.get('/investments/portfolio'),

  getSummary: () =>
    client.get('/investments/summary'),

  cancelSip: (investmentId) =>
    client.patch(`/investments/${investmentId}/cancel-sip`),

  cancelInvestment: (investmentId) =>
    client.delete(`/investments/${investmentId}`),

  // Advisor: get all investors with P&L
  getAdvisorClients: () =>
    client.get('/investments/advisor/clients'),
};

export default InvestmentAPI;
