import client from './client';

const AdminAPI = {
  getUsers: () =>
    client.get('/admin/users'),

  createUser: (name, email, password, role) =>
    client.post('/admin/users', { name, email, password, role }),

  updateUser: (id, data) =>
    client.put(`/admin/users/${id}`, data),

  deleteUser: (id) =>
    client.delete(`/admin/users/${id}`),
};

export default AdminAPI;
