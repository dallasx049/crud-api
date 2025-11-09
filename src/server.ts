import { createServer } from 'node:http';

import {
  getUsers,
  createUser,
  getUserById,
  deleteUser,
  updateUser,
} from './controllers/index.ts';

const port = process.env.PORT;

export const initServer = () => {
  const server = createServer((req, res) => {
    console.log(`Server received request on PORT ${port}`);

    if (req.method === 'GET' && req.url === '/api/users') {
      getUsers(res);
    } else if (req.method === 'POST' && req.url === '/api/users') {
      createUser(req, res);
    } else if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
      getUserById(req, res);
    } else if (req.method === 'PUT' && req.url?.startsWith('/api/users/')) {
      updateUser(req, res);
    } else if (req.method === 'DELETE' && req.url?.startsWith('/api/users/')) {
      deleteUser(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  });

  server.listen(port, () => {
    console.log(`Server is listening on PORT ${port}`);
  });
};
