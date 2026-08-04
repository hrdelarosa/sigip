export interface CreateUserData {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  password: string;
}

export interface UpdateUserData {
  roleId?: string;
  username?: string;
  fullName?: string;
  updatedAt?: Date;
}
