import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Construye un mock de AuthService con los métodos necesarios para NavbarComponent.
 */
function buildAuthServiceMock(options: {
  isAuthenticated?: boolean;
  role?: string | null;
} = {}) {
  const logout$ = new Subject<void>();
  return {
    isAuthenticated: vi.fn().mockReturnValue(options.isAuthenticated ?? false),
    getUserRole: vi.fn().mockReturnValue(options.role ?? null),
    logout: vi.fn(),
    logout$,
  };
}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let authServiceMock: ReturnType<typeof buildAuthServiceMock>;

  function setup(options: { isAuthenticated?: boolean; role?: string | null } = {}) {
    authServiceMock = buildAuthServiceMock(options);

    TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── Requirement 9.3: muestra "Iniciar sesión" cuando no autenticado ─────────

  describe('cuando el usuario NO está autenticado', () => {
    beforeEach(() => setup({ isAuthenticated: false }));

    it('debe mostrar el enlace "Iniciar sesión"', () => {
      // Validates: Requirements 9.3
      const compiled: HTMLElement = fixture.nativeElement;
      const loginLink = compiled.querySelector('a[href="/auth/login"]');
      expect(loginLink).not.toBeNull();
      expect(loginLink?.textContent?.trim()).toBe('Iniciar sesión');
    });

    it('NO debe mostrar los enlaces de navegación autenticados', () => {
      // Validates: Requirements 9.3, 9.4
      const compiled: HTMLElement = fixture.nativeElement;
      // The brand also links to /experiences, so we check nav-link items specifically
      const navLinks = compiled.querySelectorAll('.nav-link');
      const navLinkHrefs = Array.from(navLinks).map((el) => el.getAttribute('href'));
      expect(navLinkHrefs).not.toContain('/reservations');
      expect(navLinkHrefs).not.toContain('/reviews');
    });

    it('NO debe mostrar el enlace Admin', () => {
      // Validates: Requirements 9.5
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('a[href="/admin"]')).toBeNull();
    });

    it('NO debe mostrar el botón "Cerrar sesión"', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const logoutBtn = Array.from(compiled.querySelectorAll('button')).find(
        (btn) => btn.textContent?.trim() === 'Cerrar sesión'
      );
      expect(logoutBtn).toBeUndefined();
    });
  });

  // ─── Requirement 9.4: muestra enlaces de navegación cuando autenticado ───────

  describe('cuando el usuario está autenticado con rol USER', () => {
    beforeEach(() => setup({ isAuthenticated: true, role: 'USER' }));

    it('debe mostrar el enlace a /experiences', () => {
      // Validates: Requirements 9.4
      const compiled: HTMLElement = fixture.nativeElement;
      // Use .nav-link to avoid matching the navbar-brand which also links to /experiences
      const navLinks = Array.from(compiled.querySelectorAll('a.nav-link'));
      const experienciasLink = navLinks.find((el) => el.getAttribute('href') === '/experiences');
      expect(experienciasLink).toBeDefined();
      expect(experienciasLink?.textContent?.trim()).toBe('Experiencias');
    });

    it('debe mostrar el enlace a /reservations', () => {
      // Validates: Requirements 9.4
      const compiled: HTMLElement = fixture.nativeElement;
      const link = compiled.querySelector('a[href="/reservations"]');
      expect(link).not.toBeNull();
      expect(link?.textContent?.trim()).toBe('Reservas');
    });

    it('debe mostrar el enlace a /reviews', () => {
      // Validates: Requirements 9.4
      const compiled: HTMLElement = fixture.nativeElement;
      const link = compiled.querySelector('a[href="/reviews"]');
      expect(link).not.toBeNull();
      expect(link?.textContent?.trim()).toBe('Reseñas');
    });

    it('NO debe mostrar el enlace Admin para un usuario con rol USER', () => {
      // Validates: Requirements 9.5
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('a[href="/admin"]')).toBeNull();
    });

    it('NO debe mostrar el enlace "Iniciar sesión"', () => {
      // Validates: Requirements 9.3
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('a[href="/auth/login"]')).toBeNull();
    });
  });

  // ─── Requirement 9.5: muestra enlace Admin solo con rol ADMIN ────────────────

  describe('cuando el usuario está autenticado con rol ADMIN', () => {
    beforeEach(() => setup({ isAuthenticated: true, role: 'ADMIN' }));

    it('debe mostrar el enlace a /admin', () => {
      // Validates: Requirements 9.5
      const compiled: HTMLElement = fixture.nativeElement;
      const adminLink = compiled.querySelector('a[href="/admin"]');
      expect(adminLink).not.toBeNull();
      expect(adminLink?.textContent?.trim()).toBe('Admin');
    });

    it('debe mostrar también los enlaces de navegación estándar', () => {
      // Validates: Requirements 9.4, 9.5
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('a[href="/experiences"]')).not.toBeNull();
      expect(compiled.querySelector('a[href="/reservations"]')).not.toBeNull();
      expect(compiled.querySelector('a[href="/reviews"]')).not.toBeNull();
    });
  });

  // ─── Requirement 9.6: botón "Cerrar sesión" invoca authService.logout() ──────

  describe('botón "Cerrar sesión"', () => {
    beforeEach(() => setup({ isAuthenticated: true, role: 'USER' }));

    it('debe invocar authService.logout() al hacer clic', () => {
      // Validates: Requirements 9.6
      const compiled: HTMLElement = fixture.nativeElement;
      const logoutBtn = Array.from(compiled.querySelectorAll('button')).find(
        (btn) => btn.textContent?.trim() === 'Cerrar sesión'
      );
      expect(logoutBtn).toBeDefined();

      logoutBtn!.click();

      expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Reacción al evento logout$ ──────────────────────────────────────────────

  describe('reacción al evento logout$', () => {
    it('debe actualizar el estado de autenticación cuando logout$ emite', () => {
      // Validates: Requirements 9.3, 9.6
      setup({ isAuthenticated: true, role: 'USER' });

      expect(component.isAuthenticated).toBe(true);

      // Simular que el usuario cierra sesión: el servicio ahora retorna false
      authServiceMock.isAuthenticated.mockReturnValue(false);
      authServiceMock.getUserRole.mockReturnValue(null);

      // Emitir el evento logout$
      authServiceMock.logout$.next();

      expect(component.isAuthenticated).toBe(false);
      expect(component.isAdmin).toBe(false);
    });
  });

  // ─── Brand "Smart Tourism" ───────────────────────────────────────────────────

  describe('brand', () => {
    beforeEach(() => setup());

    it('debe mostrar el texto "Smart Tourism" enlazando a /experiences', () => {
      // Validates: Requirements 9.2
      const compiled: HTMLElement = fixture.nativeElement;
      const brand = compiled.querySelector('.navbar-brand');
      expect(brand).not.toBeNull();
      expect(brand?.textContent?.trim()).toBe('Smart Tourism');
      expect(brand?.getAttribute('href')).toBe('/experiences');
    });
  });
});
