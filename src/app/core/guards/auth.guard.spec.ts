import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getUserRole: ReturnType<typeof vi.fn>;
  };
  let routerSpy: {
    navigate: ReturnType<typeof vi.fn>;
    createUrlTree: ReturnType<typeof vi.fn>;
  };
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    mockUrlTree = {} as UrlTree;

    authServiceSpy = {
      isAuthenticated: vi.fn(),
      getUserRole: vi.fn(),
    };

    routerSpy = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue(mockUrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  function runGuard(): unknown {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  // ─── Requirement 7.3: retorna true cuando hay token ─────────────────────────

  it('debe retornar true cuando el usuario está autenticado', () => {
    // Validates: Requirements 7.1, 7.3
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = runGuard();

    expect(result).toBe(true);
  });

  // ─── Requirement 7.2: retorna UrlTree a /auth/login cuando no hay token ─────

  it('debe retornar un UrlTree a /auth/login cuando el usuario no está autenticado', () => {
    // Validates: Requirements 7.1, 7.2
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = runGuard();

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(mockUrlTree);
  });

  it('no debe llamar a createUrlTree cuando el usuario está autenticado', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    runGuard();

    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });
});
