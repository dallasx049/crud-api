import type { ServerResponse } from 'node:http';
import { users } from '../models/users.ts';

export const getUsers = (res: ServerResponse) => {
  try {
    const allUsers = users.get();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(allUsers));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
