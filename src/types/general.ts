import type { TUser } from './user.js';

export type TWorkerMessage =
  | {
      type: 'get';
      payload: null;
    }
  | {
      type: 'create';
      payload: unknown;
    }
  | {
      type: 'getById';
      payload: string | undefined;
    }
  | {
      type: 'update';
      payload: {
        id: string | undefined;
        body: unknown;
      };
    }
  | {
      type: 'delete';
      payload: string | undefined;
    };

export type TClusterMessage =
  | {
      type: 'get';
      payload: TUser[];
    }
  | {
      type: 'create';
      payload: TUser;
    }
  | {
      type: 'getById';
      payload: TUser;
    }
  | {
      type: 'update';
      payload: TUser;
    }
  | {
      type: 'delete';
      payload: null;
    }
  | {
      type: 'error';
      payload: {
        statusCode: number;
        message: string;
      };
    };
