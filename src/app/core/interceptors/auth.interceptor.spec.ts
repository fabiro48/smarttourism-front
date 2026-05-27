import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ─── Requirement 6.2: adjunta Authorization header cuando hay token ─────────

  it('debe adjuntar el header Authorization: Bearer cuando hay token en localStorage', () => {
    // Validates: Requirements 6.1, 6.2
    localStorage.setItem('auth_token', 'test-jwt-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer test-jwt-token'
    );
    req.flush({});
  });

  // ─── Requirement 6.3: no adjunta header cuando no hay token ─────────────────

  it('debe dejar pasar la petición sin header Authorization cuando no hay token', () => {
    // Validates: Requirements 6.1, 6.3
    // localStorage está vacío (limpiado en beforeEach)

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  // ─── Requirement 6.4: elimina token y redirige en respuesta 401 ─────────────

  it('debe eliminar el token de localStorage y redirigir a /auth/login en respuesta 401', () => {
    // Validates: Requirement 6.4
    localStorage.setItem('auth_token', 'test-jwt-token');

    httpClient.get('/api/protected').subscribe({
      error: () => {
        // Se espera que el error sea re-lanzado por el interceptor
      },
    });

    const req = httpMock.expectOne('/api/protected');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('no debe redirigir ni eliminar el token en respuestas no-401', () => {
    localStorage.setItem('auth_token', 'test-jwt-token');

    httpClient.get('/api/test').subscribe({
      error: () => {
        // error 500 no debe disparar logout
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(localStorage.getItem('auth_token')).toBe('test-jwt-token');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
