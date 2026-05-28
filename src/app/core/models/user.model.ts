/** Roles disponibles en el sistema */
export type UserRole = 'TOURIST' | 'ADMIN';

/** Payload decodificado del JWT (re-exportado desde auth.service para uso externo) */
export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/** Información del usuario en la respuesta de autenticación */
export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

/** Respuesta del endpoint POST /api/v1/auth/login y /api/v1/auth/register */
export interface AuthResponse {
  token: string;
  user: UserInfo;
}

/** Cuerpo de la petición de login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Cuerpo de la petición de registro */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  documentNumber: string;
}
