import type { IncomingMessage, ServerResponse } from 'node:http';

import { users, UserValidationError } from '../models/users.ts';

export const createUser = (req: IncomingMessage, res: ServerResponse) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('error', (e) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  });

  req.on('end', () => {
    try {
      const createdUser = users.create(JSON.parse(body));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(createdUser));
    } catch (e) {
      if (e instanceof UserValidationError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
};
