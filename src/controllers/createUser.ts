import type { IncomingMessage, ServerResponse } from 'node:http';
import cluster from 'node:cluster';

import { users, UserValidationError } from '../models/users.ts';
import type { TClusterMessage } from '../types/general.ts';

export const createUser = (req: IncomingMessage, res: ServerResponse) => {
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
      if (cluster.isWorker) {
        process.send?.({ type: 'create', payload: JSON.parse(body) });

        process.once('message', ({ type, payload }: TClusterMessage) => {
          if (type === 'create') {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(payload));
          } else if (type === 'error') {
            res.writeHead(payload.statusCode, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ error: payload.message }));
          }
        });
      } else {
        const createdUser = users.create(JSON.parse(body));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(createdUser));
      }
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
