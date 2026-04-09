import client from './client';

const QueryAPI = {
  askQuestion: (question) =>
    client.post('/queries', { question }),

  myQueries: () =>
    client.get('/queries/my'),

  allQueries: () =>
    client.get('/queries'),

  replyToQuery: (id, answer) =>
    client.patch(`/queries/${id}/reply`, { answer }),
};

export default QueryAPI;
