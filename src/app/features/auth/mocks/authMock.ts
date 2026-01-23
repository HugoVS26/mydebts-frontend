import type { AuthResponse, RegisterRequest } from '../types/auth';

export const registerRequestMock: RegisterRequest = {
  firstName: 'José',
  lastName: 'García',
  email: 'jose@example.com',
  password: 'Password123!',
};

export const authResponseMock: AuthResponse = {
  token: 'mock-jwt-token',
  user: {
    id: '123',
    firstName: 'Jose',
    lastName: 'García',
    displayName: 'José García',
    email: 'jose@example.com',
    role: 'user',
  },
};
