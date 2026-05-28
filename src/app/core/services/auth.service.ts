import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

/** Clave usada en localStorage para almacenar el JWT */
const TOKEN_KEY = 'auth_token';

/** Payload decodificado del JWT (campos relevantes para el frontend) */
export interface JwtPayload {
  sub: string;       // email / username
  role: string;      // 'USER' | 'ADMIN'
  exp: number;       // Unix timestamp de expiración
  iat: number;       // Unix timestamp de emisión
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  /**
   * Subject que emite cuando el usuario cierra sesión.
   * Los componentes (e.g. Navbar) se suscriben para actualizar su estado.
   */
  readonly logout$ = new Subject<void>();

  /**
   * Almacena el token JWT en localStorage.
   * @param token - JWT recibido del backend tras login exitoso.
   */
  login(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Elimina el token de localStorage, emite el evento logout$
   * y redirige al usuario a /auth/login.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.logout$.next();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Retorna el token JWT almacenado o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Retorna true si existe un token en localStorage.
   * No valida expiración (el backend rechazará tokens expirados con 401).
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Decodifica el payload del JWT y retorna el campo `role`.
   * Retorna null si no hay token o si el payload no contiene `role`.
   *
   * NOTA: No verifica la firma del JWT (eso es responsabilidad del backend).
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodePayload(token);
      return payload?.role ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Decodifica la sección payload (base64url) del JWT.
   * @internal
   */
  private decodePayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  }

  /**
   * Realiza la petición de login al backend.
   * El componente es responsable de llamar a this.login(token) con la respuesta.
   */
  loginHttp(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, body);
  }

  /**
   * Realiza la petición de registro al backend.
   * El componente es responsable de llamar a this.login(token) con la respuesta.
   */
  registerHttp(name: string, email: string, password: string): Observable<AuthResponse> {
    const body: RegisterRequest = { name, email, password };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, body);
  }
}
