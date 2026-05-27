/** Roles disponibles en el sistema */
export type UserRole = 'USER' | 'ADMIN';

/** Payload decodificado del JWT (re-exportado desde auth.service para uso externo) */
export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/** Respuesta del endpoint POST /api/auth/login */
export interface AuthResponse {
  token: string;
}

/** Cuerpo de la petición de login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Cuerpo de la petición de registro */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
