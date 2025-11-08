import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  users,
  UserNotFoundError,
  UserIdValidationError,
} from '../models/users.ts';

export const deleteUser = (req: IncomingMessage, res: ServerResponse) => {
  const userId = req.url?.split('/').at(-1);

  try {
    const deletedUser = users.delete(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(deletedUser));
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
