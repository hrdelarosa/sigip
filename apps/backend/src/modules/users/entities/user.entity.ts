export class User {
  id!: string;
  roleId!: string;
  username!: string;
  fullName!: string;
  password!: string;
  isActive!: boolean;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
