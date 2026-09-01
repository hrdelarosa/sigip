export interface LoginRequest {
  username: string
  password: string
}

export interface AuthenticatedRoleResponse {
  id: string
  code: string
  name: string
}

export interface AuthenticatedOfficeResponse {
  id: string
  code: string
  name: string
}

export interface AuthenticatedUserResponse {
  id: string
  username: string
  fullName: string
  office: AuthenticatedOfficeResponse
  role: AuthenticatedRoleResponse
  permissions: string[]
}

export type LoginResponse = AuthenticatedUserResponse
export type AuthMeResponse = AuthenticatedUserResponse

export interface SessionResponse {
  id: string
  createdAt: string
  lastActivityAt: string
  idleExpiresAt: string
  absoluteExpiresAt: string
  revokedAt: string | null
  revokedReason: string | null
  ipAddress: string | null
  userAgent: string | null
  isCurrent: boolean
}

export type SessionsResponse = SessionResponse[]
