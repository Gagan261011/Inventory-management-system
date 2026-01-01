export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  warehouseId?: number;
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  roles: string[];
  warehouseId?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  warehouseId?: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  warehouseId?: number;
  active?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
