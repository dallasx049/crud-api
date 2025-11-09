import type { IncomingMessage, ServerResponse } from 'node:http';
import cluster from 'node:cluster';

import {
  users,
  UserNotFoundError,
  UserIdValidationError,
} from '../models/users.ts';
import type { TClusterMessage } from '../types/general.js';

export const deleteUser = (req: IncomingMessage, res: ServerResponse) => {
  const userId = req.url?.split('/').at(-1);

  try {
    if (cluster.isWorker) {
      process.send?.({ type: 'delete', payload: userId });

      process.once('message', ({ type }: TClusterMessage) => {
        if (type === 'delete') {
          res.writeHead(204, { 'Content-Type': 'application/json' });
          res.end();
        }
      });
    } else {
      users.delete(userId);
      res.writeHead(204, { 'Content-Type': 'application/json' });
      res.end();
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
