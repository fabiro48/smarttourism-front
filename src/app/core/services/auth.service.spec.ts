import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Construye un JWT falso con el payload dado, codificado en base64url.
 * La firma es un placeholder; no se verifica en el frontend.
 */
function buildFakeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${header}.${encodedPayload}.fakesignature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);

    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─── login() ────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('debe almacenar el token en localStorage bajo la clave "auth_token"', () => {
      // Validates: Requirement 8.2
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });

      service.login(token);

      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('debe sobreescribir un token previo al llamar login() de nuevo', () => {
      const firstToken = buildFakeJwt({ sub: 'a@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      const secondToken = buildFakeJwt({ sub: 'b@test.com', role: 'ADMIN', exp: 9999999999, iat: 1000000000 });

      service.login(firstToken);
      service.login(secondToken);

      expect(localStorage.getItem('auth_token')).toBe(secondToken);
    });
  });

  // ─── logout() ───────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('debe eliminar el token de localStorage', () => {
      // Validates: Requirement 8.3
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      localStorage.setItem('auth_token', token);

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('debe emitir en el Subject logout$', () => {
      // Validates: Requirement 8.7
      let emitted = false;
      service.logout$.subscribe(() => { emitted = true; });

      service.logout();

      expect(emitted).toBe(true);
    });

    it('debe navegar a /auth/login tras el logout', () => {
      service.logout();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  // ─── isAuthenticated() ──────────────────────────────────────────────────────

  describe('isAuthenticated()', () => {
    it('debe retornar true cuando hay un token en localStorage', () => {
      // Validates: Requirement 8.5
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      localStorage.setItem('auth_token', token);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('debe retornar false cuando no hay token en localStorage', () => {
      // Validates: Requirement 8.5
      // localStorage ya está limpio por el beforeEach
      expect(service.isAuthenticated()).toBe(false);
    });

    it('debe retornar false después de llamar logout()', () => {
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      service.login(token);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // ─── getUserRole() ──────────────────────────────────────────────────────────

  describe('getUserRole()', () => {
    it('debe decodificar correctamente el campo role del JWT payload (ADMIN)', () => {
      // Validates: Requirement 8.6
      const token = buildFakeJwt({ sub: 'admin@test.com', role: 'ADMIN', exp: 9999999999, iat: 1000000000 });
      service.login(token);

      expect(service.getUserRole()).toBe('ADMIN');
    });

    it('debe decodificar correctamente el campo role del JWT payload (USER)', () => {
      // Validates: Requirement 8.6
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      service.login(token);

      expect(service.getUserRole()).toBe('USER');
    });

    it('debe retornar null con un token malformado (no tiene 3 partes)', () => {
      // Validates: Requirement 8.6
      localStorage.setItem('auth_token', 'token.sinpuntos');

      expect(service.getUserRole()).toBeNull();
    });

    it('debe retornar null cuando no hay token en localStorage', () => {
      // Validates: Requirement 8.6
      // localStorage ya está limpio por el beforeEach
      expect(service.getUserRole()).toBeNull();
    });

    it('debe retornar null cuando el payload no contiene el campo role', () => {
      // Validates: Requirement 8.6
      const token = buildFakeJwt({ sub: 'user@test.com', exp: 9999999999, iat: 1000000000 });
      service.login(token);

      expect(service.getUserRole()).toBeNull();
    });
  });

  // ─── getToken() ─────────────────────────────────────────────────────────────

  describe('getToken()', () => {
    it('debe retornar el token almacenado en localStorage', () => {
      // Validates: Requirement 8.4
      const token = buildFakeJwt({ sub: 'user@test.com', role: 'USER', exp: 9999999999, iat: 1000000000 });
      localStorage.setItem('auth_token', token);

      expect(service.getToken()).toBe(token);
    });

    it('debe retornar null cuando no hay token en localStorage', () => {
      // Validates: Requirement 8.4
      expect(service.getToken()).toBeNull();
    });
  });
});
