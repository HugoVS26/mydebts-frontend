export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  turnstileToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    role: string;
  };
}

export interface ForgotPasswordSubmit {
  email: string;
  turnstileToken: string;
}
