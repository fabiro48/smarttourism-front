import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
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
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }

  // ─── Requirement 7.5: retorna true cuando el rol es ADMIN ───────────────────

  it('debe retornar true cuando el usuario tiene rol ADMIN', () => {
    // Validates: Requirements 7.4, 7.5
    authServiceSpy.getUserRole.mockReturnValue('ADMIN');

    const result = runGuard();

    expect(result).toBe(true);
  });

  // ─── Requirement 7.6: retorna UrlTree a /experiences cuando no es ADMIN ─────

  it('debe retornar un UrlTree a /experiences cuando el usuario no tiene rol ADMIN', () => {
    // Validates: Requirements 7.4, 7.6
    authServiceSpy.getUserRole.mockReturnValue('USER');

    const result = runGuard();

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/experiences']);
    expect(result).toBe(mockUrlTree);
  });

  it('debe retornar un UrlTree a /experiences cuando el usuario no está autenticado (rol null)', () => {
    // Validates: Requirements 7.4, 7.6
    authServiceSpy.getUserRole.mockReturnValue(null);

    const result = runGuard();

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/experiences']);
    expect(result).toBe(mockUrlTree);
  });

  it('no debe llamar a createUrlTree cuando el usuario tiene rol ADMIN', () => {
    authServiceSpy.getUserRole.mockReturnValue('ADMIN');

    runGuard();

    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });
});
