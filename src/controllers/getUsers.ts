import type { ServerResponse } from 'node:http';
import cluster from 'node:cluster';

import { users } from '../models/users.ts';
import type { TClusterMessage } from '../types/general.ts';

export const getUsers = (res: ServerResponse) => {
  try {
    if (cluster.isWorker) {
      process.send?.({ type: 'get', payload: null });

      process.once('message', ({ type, payload }: TClusterMessage) => {
        if (type === 'get') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(payload));
        } else if (type === 'error') {
          res.writeHead(payload.statusCode, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ error: payload.message }));
        }
      });
    } else {
      const allUsers = users.get();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allUsers));
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
