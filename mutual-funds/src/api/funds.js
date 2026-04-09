import client from './client';

const FundAPI = {
  getAll: (params = {}) =>
    client.get('/funds', { params }),

  getById: (id) =>
    client.get(`/funds/${id}`),

  search: (q) =>
    client.get('/funds', { params: { q } }),

  create: (fund) =>
    client.post('/funds', fund),

  update: (id, fund) =>
    client.put(`/funds/${id}`, fund),

  delete: (id) =>
    client.delete(`/funds/${id}`),

  updatePerformance: (id, nav, return1y, return3y, return5y) =>
    client.patch(`/funds/${id}/performance`, { nav, return1y, return3y, return5y }),
};

export default FundAPI;
