export interface AuthenticatedUserModel {
  userId: string;
  sessionId: string;
  username: string;
  fullName: string;
  office: {
    id: string;
    code: string;
    name: string;
  };
  role: {
    id: string;
    code: string;
    name: string;
  };
  permissions: string[];
}
