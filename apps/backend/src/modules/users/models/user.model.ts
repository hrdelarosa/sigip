export interface UserModel {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPasswordModel extends UserModel {
  passwordHash: string;
}
