export interface UserResponse {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UsersResponse = UserResponse[];

export interface CreateUserRequest {
  roleId: string;
  username: string;
  fullName: string;
  password: string;
}

export interface UpdateUserRequest {
  roleId?: string;
  username?: string;
  fullName?: string;
}

export interface ChangeUserStatusRequest {
  isActive: boolean;
}

export interface ChangeUserPasswordRequest {
  password: string;
}
