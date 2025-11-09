import type { IncomingMessage, ServerResponse } from 'node:http';
import cluster from 'node:cluster';

import {
  users,
  UserNotFoundError,
  UserIdValidationError,
} from '../models/users.ts';
import type { TClusterMessage } from '../types/general.ts';

export const getUserById = (req: IncomingMessage, res: ServerResponse) => {
  const userId = req.url?.split('/').at(-1);

  try {
    if (cluster.isWorker) {
      process.send?.({ type: 'getById', payload: userId });

      process.once('message', (message: TClusterMessage) => {
        if (message.type === 'getById') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(message.payload));
        }
      });
    } else {
      const user = users.getById(userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    }
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    } else if (e instanceof UserIdValidationError) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
};
