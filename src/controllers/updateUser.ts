import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  users,
  UserNotFoundError,
  UserIdValidationError,
  UserValidationError,
} from '../models/users.ts';

export const updateUser = (req: IncomingMessage, res: ServerResponse) => {
  const userId = req.url?.split('/').at(-1);

  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  });

  req.on('end', () => {
    try {
      const updatedUser = users.update(userId, JSON.parse(body));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updatedUser));
    } catch (e) {
      if (e instanceof UserIdValidationError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else if (e instanceof UserValidationError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else if (e instanceof UserNotFoundError) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
};
