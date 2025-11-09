import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createServer, request } from 'node:http';

import {
  UserIdValidationError,
  UserNotFoundError,
  users,
  UserValidationError,
} from './models/users.ts';
import type { TWorkerMessage } from './types/general.ts';

export const initLoadBalancer = () => {
  const FIRST_WORKER_ID = 1;

  const port = +process.env.PORT!;
  const numCpus = availableParallelism();
  const maxWorkers = numCpus - 1;

  for (let i = FIRST_WORKER_ID; i <= maxWorkers; i++) {
    cluster.fork({ PORT: port + i });
  }

  let currentWorkerId = FIRST_WORKER_ID;

  const loadBalancer = createServer((req, res) => {
    const proxyReq = request(
      {
        port: port + currentWorkerId,
        method: req.method,
        path: req.url,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    req.pipe(proxyReq);

    proxyReq.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    });

    proxyReq.on('close', () => {
      if (currentWorkerId++ === maxWorkers) {
        currentWorkerId = FIRST_WORKER_ID;
      }
    });
  });

  cluster.on('message', (worker, { type, payload }: TWorkerMessage) => {
    try {
      switch (type) {
        case 'create': {
          worker.send({ type, payload: users.create(payload) });
          break;
        }
        case 'get': {
          worker.send({ type, payload: users.get() });
          break;
        }
        case 'getById': {
          worker.send({ type, payload: users.getById(payload) });
          break;
        }
        case 'update': {
          worker.send({
            type,
            payload: users.update(payload.id, payload.body),
          });
          break;
        }
        case 'delete': {
          users.delete(payload);
          worker.send({ type, payload: null });
          break;
        }
      }
    } catch (e) {
      let statusCode = 500;

      if (e instanceof UserNotFoundError) {
        statusCode = 404;
      } else if (
        e instanceof UserIdValidationError ||
        e instanceof UserValidationError
      ) {
        statusCode = 400;
      }

      worker.send({
        type: 'error',
        payload: {
          statusCode,
          message: (e as Error).message,
        },
      });
    }
  });

  loadBalancer.listen(port, () => {
    console.log(`Load balancer is listening on PORT ${port}`);
  });
};
