import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createServer, request } from 'node:http';

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

  loadBalancer.listen(port, () => {
    console.log(`Load balancer is listening on PORT ${port}`);
  });
};
