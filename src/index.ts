import 'dotenv/config';

import cluster from 'node:cluster';

import { initServer } from './server.ts';
import { initLoadBalancer } from './loadBalancer.ts';

if (process.env.ENABLE_LOAD_BALANCER && cluster.isPrimary) {
  initLoadBalancer();
} else {
  initServer();
}
