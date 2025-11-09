import { v4 as generateId, validate } from 'uuid';

import type { TUser } from '../types/user.ts';

interface IUsersService {
  get: () => TUser[];
  getById: (id: string | undefined) => TUser;
  create: (payload: unknown) => TUser;
  update: (id: string | undefined, payload: unknown) => TUser;
  delete: (id: string | undefined) => void;
}

class UsersService implements IUsersService {
  private users: TUser[] = [];

  constructor() {}

  public get(): TUser[] {
    return this.users;
  }

  public create(payload: unknown): TUser {
    this.validateCreateUserPayload(payload);

    const { username, age, hobbies } = payload as Omit<TUser, 'id'>;
    const user = { id: generateId(), username, age, hobbies };

    this.users.push(user);

    return user;
  }

  public update(id: string | undefined, payload: unknown): TUser {
    this.validateUserId(id);
    this.validateUpdateUserPayload(payload);

    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new UserNotFoundError();
    }

    const user = this.users[userIndex];

    const { username, age, hobbies } = payload as Partial<Omit<TUser, 'id'>>;

    const updatedUser = {
      id: user.id,
      username: username ?? user.username,
      age: age ?? user.age,
      hobbies: hobbies ?? user.hobbies,
    };

    this.users[userIndex] = updatedUser;

    return updatedUser;
  }

  public getById(id?: string): TUser {
    this.validateUserId(id);

    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }

  public delete(id?: string) {
    this.validateUserId(id);

    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new UserNotFoundError();
    }

    this.users.splice(userIndex, 1);
  }

  private validateUserId(id?: string) {
    if (!id || !validate(id)) {
      throw new UserIdValidationError();
    }
  }

  private validateCreateUserPayload(payload: unknown) {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new UserValidationError('Payload must be an object');
    }

    if (!('username' in payload)) {
      throw new UserValidationError('Username is required');
    }
    if (!('age' in payload)) {
      throw new UserValidationError('Age is required');
    }
    if (!('hobbies' in payload)) {
      throw new UserValidationError('Hobbies is required');
    }

    const { username, age, hobbies } = payload;

    if (typeof username !== 'string') {
      throw new UserValidationError('Username must be of type String');
    }
    if (!username.trim()) {
      throw new UserValidationError(
        'Username should contain at least 1 character',
      );
    }

    if (typeof age !== 'number') {
      throw new UserValidationError('Age must be of type Number');
    }

    if (!Array.isArray(hobbies)) {
      throw new UserValidationError('Hobbies must be of type Array');
    }
    if (hobbies.some((item) => typeof item !== 'string')) {
      throw new UserValidationError('Hobbies array must contain only strings');
    }
  }

  private validateUpdateUserPayload(payload: unknown) {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new UserValidationError('Payload must be an object');
    }

    if ('username' in payload) {
      if (typeof payload.username !== 'string') {
        throw new UserValidationError('Username must be of type String');
      }
      if (!payload.username.trim()) {
        throw new UserValidationError(
          'Username should contain at least 1 character',
        );
      }
    }

    if ('age' in payload && typeof payload.age !== 'number') {
      throw new UserValidationError('Age must be of type Number');
    }

    if ('hobbies' in payload) {
      if (!Array.isArray(payload.hobbies)) {
        throw new UserValidationError('Hobbies must be of type Array');
      }
      if (payload.hobbies.some((item) => typeof item !== 'string')) {
        throw new UserValidationError(
          'Hobbies array must contain only strings',
        );
      }
    }
  }
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserIdValidationError extends Error {
  constructor(message = 'User id is invalid') {
    super(message);
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User with provided id not found') {
    super(message);
  }
}

export const users = new UsersService();
