import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);

    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
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

  // ─── loginHttp() ────────────────────────────────────────────────────────────

  describe('loginHttp()', () => {
    it('debe realizar POST a la URL correcta con el cuerpo {email, password}', () => {
      // Validates: Requirements 5.1, 5.3
      const email = 'user@test.com';
      const password = 'password123';
      const mockResponse = { token: 'fake-jwt-token' };

      service.loginHttp(email, password).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('debe retornar un Observable que emite el objeto {token} cuando el backend responde exitosamente', () => {
      // Validates: Requirement 5.5
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.test.signature';
      let receivedToken: string | undefined;

      service.loginHttp('user@test.com', 'pass123').subscribe(res => {
        receivedToken = res.token;
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ token: mockToken });

      expect(receivedToken).toBe(mockToken);
    });

    it('debe propagar el error HTTP al suscriptor cuando el backend responde con error', () => {
      // Validates: Requirement 5.6
      let errorReceived = false;

      service.loginHttp('user@test.com', 'wrongpass').subscribe({
        next: () => {},
        error: () => { errorReceived = true; }
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
    });
  });

  // ─── registerHttp() ─────────────────────────────────────────────────────────

  describe('registerHttp()', () => {
    it('debe realizar POST a la URL correcta con el cuerpo {name, email, password}', () => {
      // Validates: Requirements 5.2, 5.4
      const name = 'John Doe';
      const email = 'john@test.com';
      const password = 'password123';
      const mockResponse = { token: 'fake-jwt-token' };

      service.registerHttp(name, email, password).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name, email, password });
      req.flush(mockResponse);
    });

    it('debe retornar un Observable que emite el objeto {token} cuando el backend responde exitosamente', () => {
      // Validates: Requirement 5.5
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.test.signature';
      let receivedToken: string | undefined;

      service.registerHttp('Jane', 'jane@test.com', 'pass123').subscribe(res => {
        receivedToken = res.token;
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ token: mockToken });

      expect(receivedToken).toBe(mockToken);
    });

    it('debe propagar el error HTTP al suscriptor cuando el backend responde con error', () => {
      // Validates: Requirement 5.6
      let errorReceived = false;

      service.registerHttp('Jane', 'existing@test.com', 'pass123').subscribe({
        next: () => {},
        error: () => { errorReceived = true; }
      });

      const req = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });

      expect(errorReceived).toBe(true);
    });
  });
});

// ─── Imports adicionales para P5 y P6 ────────────────────────────────────────
import { LoginComponent } from '../../features/auth/login/login.component';
import { RegisterComponent } from '../../features/auth/register/register.component';
import { environment as env } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

// ─── P1 — Invariante de autenticación ────────────────────────────────────────
// Validates: Requirement 5.5

describe('P1 — Invariante de autenticación', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn() } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('si isAuthenticated() retorna true, entonces localStorage tiene un token no nulo y no vacío', () => {
    // Validates: Requirement 5.5
    const token = 'eyJhbGciOiJIUzI1NiJ9.payload.signature';
    service.login(token);

    const authenticated = service.isAuthenticated();
    const storedToken = localStorage.getItem('auth_token');

    expect(authenticated).toBe(true);
    expect(storedToken).not.toBeNull();
    expect(storedToken).not.toBe('');
    expect(storedToken).toBe(token);
  });

  it('contrarrecíproco: si no hay token en localStorage, isAuthenticated() retorna false', () => {
    // Validates: Requirement 5.5
    // localStorage ya está limpio
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('contrarrecíproco: tras logout(), no hay token y isAuthenticated() retorna false', () => {
    // Validates: Requirement 5.5
    const token = 'eyJhbGciOiJIUzI1NiJ9.payload.signature';
    service.login(token);
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('la invariante se mantiene para múltiples tokens distintos', () => {
    // Validates: Requirement 5.5
    const tokens = [
      'token-abc-123',
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQHRlc3QuY29tIn0.sig',
      'short',
      'a'.repeat(200),
    ];

    for (const token of tokens) {
      service.login(token);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('auth_token')).toBe(token);
      localStorage.clear();
    }
  });
});

// ─── P4 — Invariante de token tras login exitoso ──────────────────────────────
// Validates: Requirements 1.7, 2.8

describe('P4 — Invariante de token tras login exitoso', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn() } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('login(token) almacena exactamente el token recibido sin transformación', () => {
    // Validates: Requirements 1.7, 2.8
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQHRlc3QuY29tIn0.fakesig';

    service.login(token);

    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('el token almacenado es idéntico al recibido (sin modificaciones)', () => {
    // Validates: Requirements 1.7, 2.8
    const tokens = [
      'simple-token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.sig',
      'token-with-special-chars_-.',
    ];

    for (const token of tokens) {
      service.login(token);
      expect(localStorage.getItem('auth_token')).toBe(token);
      localStorage.clear();
    }
  });

  it('loginHttp() emite {token} y ese token queda en localStorage tras service.login()', () => {
    // Validates: Requirements 1.7, 2.8
    const httpTesting = TestBed.inject(HttpTestingController);
    const expectedToken = 'eyJhbGciOiJIUzI1NiJ9.loginpayload.sig';
    let receivedToken: string | undefined;

    service.loginHttp('user@test.com', 'pass123').subscribe(res => {
      receivedToken = res.token;
      service.login(res.token);
    });

    const req = httpTesting.expectOne(`${env.apiUrl}/auth/login`);
    req.flush({ token: expectedToken });

    expect(receivedToken).toBe(expectedToken);
    expect(localStorage.getItem('auth_token')).toBe(expectedToken);
  });

  it('registerHttp() emite {token} y ese token queda en localStorage tras service.login()', () => {
    // Validates: Requirements 1.7, 2.8
    const httpTesting = TestBed.inject(HttpTestingController);
    const expectedToken = 'eyJhbGciOiJIUzI1NiJ9.registerpayload.sig';
    let receivedToken: string | undefined;

    service.registerHttp('Jane', 'jane@test.com', 'pass123').subscribe(res => {
      receivedToken = res.token;
      service.login(res.token);
    });

    const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
    req.flush({ token: expectedToken });

    expect(receivedToken).toBe(expectedToken);
    expect(localStorage.getItem('auth_token')).toBe(expectedToken);
  });
});

// ─── P5 — Invariante de navegación tras autenticación ────────────────────────
// Validates: Requirements 1.8, 2.9

describe('P5 — Invariante de navegación tras autenticación', () => {
  describe('LoginComponent navega a /experiences tras respuesta 200', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<LoginComponent>>;
    let component: LoginComponent;
    let httpTesting: HttpTestingController;
    let routerSpy: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      routerSpy = { navigate: vi.fn() };

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [LoginComponent],
        providers: [
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: { snapshot: {}, params: {}, queryParams: {} } },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      httpTesting = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
      localStorage.clear();
    });

    it('navega a /experiences cuando el backend responde con 200 y token', () => {
      // Validates: Requirement 1.8
      component.form.setValue({ email: 'user@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/login`);
      req.flush({ token: 'fake-jwt-token' });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/experiences']);
    });

    it('no navega si el backend responde con error', () => {
      // Validates: Requirement 1.8
      component.form.setValue({ email: 'user@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/experiences']);
    });
  });

  describe('RegisterComponent navega a /experiences tras respuesta 200', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<RegisterComponent>>;
    let component: RegisterComponent;
    let httpTesting: HttpTestingController;
    let routerSpy: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      routerSpy = { navigate: vi.fn() };

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [RegisterComponent],
        providers: [
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: { snapshot: {}, params: {}, queryParams: {} } },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      httpTesting = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
      localStorage.clear();
    });

    it('navega a /experiences cuando el backend responde con 200 y token', () => {
      // Validates: Requirement 2.9
      component.form.setValue({ name: 'Jane Doe', email: 'jane@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
      req.flush({ token: 'fake-jwt-token' });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/experiences']);
    });

    it('no navega si el backend responde con error', () => {
      // Validates: Requirement 2.9
      component.form.setValue({ name: 'Jane Doe', email: 'jane@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
      req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });

      expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/experiences']);
    });
  });
});

// ─── P6 — Invariante de mensaje de error ─────────────────────────────────────
// Validates: Requirements 1.9, 1.10, 2.10, 2.11, 2.12

describe('P6 — Invariante de mensaje de error', () => {
  describe('LoginComponent — errorMessage no vacío e isLoading false tras error HTTP', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<LoginComponent>>;
    let component: LoginComponent;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [LoginComponent],
        providers: [
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: ActivatedRoute, useValue: { snapshot: {}, params: {}, queryParams: {} } },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      httpTesting = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
      localStorage.clear();
    });

    it('error 401: errorMessage no vacío e isLoading false', () => {
      // Validates: Requirement 1.9
      component.form.setValue({ email: 'user@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(component.errorMessage).not.toBe('');
      expect(component.errorMessage.length).toBeGreaterThan(0);
      expect(component.isLoading).toBe(false);
    });

    it('error 500: errorMessage no vacío e isLoading false', () => {
      // Validates: Requirement 1.10
      component.form.setValue({ email: 'user@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/login`);
      req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(component.errorMessage).not.toBe('');
      expect(component.errorMessage.length).toBeGreaterThan(0);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('RegisterComponent — errorMessage no vacío e isLoading false tras error HTTP', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<RegisterComponent>>;
    let component: RegisterComponent;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [RegisterComponent],
        providers: [
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: ActivatedRoute, useValue: { snapshot: {}, params: {}, queryParams: {} } },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      httpTesting = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
      localStorage.clear();
    });

    it('error 409: errorMessage no vacío e isLoading false', () => {
      // Validates: Requirement 2.10
      component.form.setValue({ name: 'Jane', email: 'existing@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
      req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });

      expect(component.errorMessage).not.toBe('');
      expect(component.errorMessage.length).toBeGreaterThan(0);
      expect(component.isLoading).toBe(false);
    });

    it('error 400: errorMessage no vacío e isLoading false', () => {
      // Validates: Requirement 2.11
      component.form.setValue({ name: 'Jane', email: 'jane@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
      req.flush({ message: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });

      expect(component.errorMessage).not.toBe('');
      expect(component.errorMessage.length).toBeGreaterThan(0);
      expect(component.isLoading).toBe(false);
    });

    it('error 500: errorMessage no vacío e isLoading false', () => {
      // Validates: Requirement 2.12
      component.form.setValue({ name: 'Jane', email: 'jane@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne(`${env.apiUrl}/auth/register`);
      req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(component.errorMessage).not.toBe('');
      expect(component.errorMessage.length).toBeGreaterThan(0);
      expect(component.isLoading).toBe(false);
    });
  });
});
