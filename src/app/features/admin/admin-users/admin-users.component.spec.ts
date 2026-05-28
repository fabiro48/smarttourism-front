import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import fc from 'fast-check';

import { AdminUsersComponent } from './admin-users.component';
import { AdminUsersService } from '../services/admin-users.service';
import { UserResponse } from '../models/user-admin.model';
import { Page } from '../../reservations/models/reservation.model';

// ─── Generators ────────────────────────────────────────────────────────────────

const userResponseArb = fc.record({
  id: fc.uuid(),
  fullName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 7, maxLength: 15 }).filter(s => s.trim().length > 0),
  documentNumber: fc.string({ minLength: 5, maxLength: 20 }),
  role: fc.constantFrom('TOURIST' as const, 'ADMIN' as const),
  active: fc.boolean(),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
});

const userListArb = fc.array(userResponseArb, { minLength: 1, maxLength: 50 });

// ─── Helpers ───────────────────────────────────────────────────────────────────

function createMockPage(users: UserResponse[], totalElements?: number, totalPages?: number): Page<UserResponse> {
  return {
    content: users,
    totalElements: totalElements ?? users.length,
    totalPages: totalPages ?? 1,
    number: 0,
    size: 20,
  };
}

function createMockUser(overrides: Partial<UserResponse> = {}): UserResponse {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '3001234567',
    documentNumber: '1234567890',
    role: 'TOURIST',
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}

// ─── Test Suite ────────────────────────────────────────────────────────────────

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let mockService: {
    getUsers: ReturnType<typeof vi.fn>;
    updateUserStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      getUsers: vi.fn().mockReturnValue(of(createMockPage([]))),
      updateUserStatus: vi.fn().mockReturnValue(of(createMockUser())),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminUsersService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
  });

  // ─── Property Tests ────────────────────────────────────────────────────────

  describe('Property Tests', () => {
    // Feature: admin-users-module, Property 3: Completitud de renderizado de filas de usuario
    // **Validates: Requirements 2.2, 10.4**
    it('Property 3: For any non-empty list of users, the table renders one row per user with fullName, email, phone, role, and active status', () => {
      fc.assert(
        fc.property(userListArb, (users: UserResponse[]) => {
          // Mock service to return the generated users
          mockService.getUsers.mockReturnValue(of(createMockPage(users)));

          // Re-create component for each iteration to ensure clean state
          fixture = TestBed.createComponent(AdminUsersComponent);
          component = fixture.componentInstance;
          fixture.detectChanges(); // triggers ngOnInit -> loadUsers

          const rows = fixture.nativeElement.querySelectorAll('tbody tr');
          expect(rows.length).toBe(users.length);

          users.forEach((user, index) => {
            const cells = rows[index].querySelectorAll('td');
            // DOM textContent trims whitespace, so we compare trimmed values
            expect(cells[0].textContent.trim()).toBe(user.fullName.trim());
            expect(cells[1].textContent.trim()).toBe(user.email.trim());
            expect(cells[2].textContent.trim()).toBe(user.phone.trim());

            // Role label
            const expectedRole = user.role === 'TOURIST' ? 'Turista' : 'Administrador';
            expect(cells[3].textContent.trim()).toBe(expectedRole);

            // Active status badge
            const badge = cells[4].querySelector('.status-badge');
            const expectedStatus = user.active ? 'Activo' : 'Inactivo';
            expect(badge.textContent.trim()).toBe(expectedStatus);
          });
        }),
        { numRuns: 100 }
      );
    });

    // Feature: admin-users-module, Property 4: Consistencia de UI con el estado activo del usuario
    // **Validates: Requirements 3.1, 6.7**
    it('Property 4: For any user, the action button shows "Desactivar" if active=true and "Activar" if active=false, and the status badge aria-label matches accordingly', () => {
      fc.assert(
        fc.property(userResponseArb, (user: UserResponse) => {
          // Mock service to return the generated user
          mockService.getUsers.mockReturnValue(of(createMockPage([user])));

          // Re-create component for each iteration to ensure clean state
          fixture = TestBed.createComponent(AdminUsersComponent);
          component = fixture.componentInstance;
          fixture.detectChanges(); // triggers ngOnInit -> loadUsers

          const row = fixture.nativeElement.querySelector('tbody tr');

          // Verify action button text
          const actionButton = row.querySelector('.btn-toggle-status');
          const expectedButtonText = user.active ? 'Desactivar' : 'Activar';
          expect(actionButton.textContent.trim()).toBe(expectedButtonText);

          // Verify status badge aria-label
          const badge = row.querySelector('.status-badge');
          const expectedAriaLabel = user.active ? 'Estado: Activo' : 'Estado: Inactivo';
          expect(badge.getAttribute('aria-label')).toBe(expectedAriaLabel);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ─── Unit Tests ────────────────────────────────────────────────────────────

  describe('Unit Tests', () => {
    // Requirement 10.1: Loading indicator shown while request is in progress
    it('should show loading indicator while request is in progress', () => {
      const subject = new Subject<Page<UserResponse>>();
      mockService.getUsers.mockReturnValue(subject.asObservable());

      fixture.detectChanges(); // triggers ngOnInit -> loadUsers

      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
      expect(spinner.textContent.trim()).toBe('Cargando...');

      // Complete the request
      subject.next(createMockPage([]));
      subject.complete();
      fixture.detectChanges();

      const spinnerAfter = fixture.nativeElement.querySelector('.spinner');
      expect(spinnerAfter).toBeFalsy();
    });

    // Requirement 10.2: Empty list message when no users returned
    it('should show empty message when no users are returned', () => {
      mockService.getUsers.mockReturnValue(of(createMockPage([])));

      fixture.detectChanges();

      const emptyMsg = fixture.nativeElement.querySelector('.empty-message');
      expect(emptyMsg).toBeTruthy();
      expect(emptyMsg.textContent.trim()).toBe('No se encontraron usuarios registrados');
    });

    // Requirement 10.3: Error message display when backend returns error
    it('should show error message when backend returns error', () => {
      mockService.getUsers.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
      );

      fixture.detectChanges();

      const errorMsg = fixture.nativeElement.querySelector('.error-message');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent.trim()).toBe('Error al cargar los usuarios. Intenta de nuevo más tarde');
      expect(errorMsg.getAttribute('role')).toBe('alert');
    });

    // Requirement 10.5: Clicking action button shows ConfirmationDialog with correct message
    it('should show confirmation dialog with correct message when action button is clicked', () => {
      const user = createMockUser({ active: true, fullName: 'María García' });
      mockService.getUsers.mockReturnValue(of(createMockPage([user])));

      fixture.detectChanges();

      const actionButton = fixture.nativeElement.querySelector('.btn-toggle-status');
      actionButton.click();
      fixture.detectChanges();

      expect(component.showDialog).toBe(true);
      expect(component.dialogTitle).toBe('Desactivar usuario');
      expect(component.dialogMessage).toBe('¿Está seguro de que desea desactivar al usuario María García?');

      // Verify dialog is rendered
      const dialog = fixture.nativeElement.querySelector('app-confirmation-dialog');
      expect(dialog).toBeTruthy();
    });

    // Requirement 10.5 (inactive user variant)
    it('should show "Activar" dialog for inactive user', () => {
      const user = createMockUser({ active: false, fullName: 'Carlos López' });
      mockService.getUsers.mockReturnValue(of(createMockPage([user])));

      fixture.detectChanges();

      const actionButton = fixture.nativeElement.querySelector('.btn-toggle-status');
      actionButton.click();
      fixture.detectChanges();

      expect(component.showDialog).toBe(true);
      expect(component.dialogTitle).toBe('Activar usuario');
      expect(component.dialogMessage).toBe('¿Está seguro de que desea activar al usuario Carlos López?');
    });

    // Requirement 10.6: Confirming action updates user status in table
    it('should update user status in table after confirming action', () => {
      const user = createMockUser({ active: true, fullName: 'Ana Ruiz' });
      mockService.getUsers.mockReturnValue(of(createMockPage([user])));
      mockService.updateUserStatus.mockReturnValue(of({ ...user, active: false }));

      fixture.detectChanges();

      // Click action button to open dialog
      const actionButton = fixture.nativeElement.querySelector('.btn-toggle-status');
      actionButton.click();
      fixture.detectChanges();

      // Confirm the action
      component.onConfirmToggle();
      fixture.detectChanges();

      // Verify user status updated in table
      const badge = fixture.nativeElement.querySelector('.status-badge');
      expect(badge.textContent.trim()).toBe('Inactivo');
      expect(badge.getAttribute('aria-label')).toBe('Estado: Inactivo');

      // Verify button text changed
      const updatedButton = fixture.nativeElement.querySelector('.btn-toggle-status');
      expect(updatedButton.textContent.trim()).toBe('Activar');

      // Verify dialog is closed
      expect(component.showDialog).toBe(false);
    });

    // Requirement 10.7: Pagination controls shown when totalElements > 20
    it('should show pagination controls when totalElements > pageSize', () => {
      const users = [createMockUser()];
      mockService.getUsers.mockReturnValue(of(createMockPage(users, 25, 2)));

      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('.pagination-controls');
      expect(pagination).toBeTruthy();

      const buttons = pagination.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent.trim()).toBe('Anterior');
      expect(buttons[1].textContent.trim()).toBe('Siguiente');
    });

    // Requirement 10.8: "Anterior" button disabled on first page
    it('should disable "Anterior" button on first page', () => {
      const users = [createMockUser()];
      mockService.getUsers.mockReturnValue(of(createMockPage(users, 25, 2)));

      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('.pagination-controls');
      const prevButton = pagination.querySelector('button[aria-label="Página anterior"]');
      expect(prevButton.disabled).toBe(true);
    });

    // "Siguiente" button disabled on last page
    it('should disable "Siguiente" button on last page', () => {
      const users = [createMockUser()];
      // First call returns page 0 of 2
      mockService.getUsers
        .mockReturnValueOnce(of(createMockPage(users, 25, 2)))
        // Second call (next page) returns page 1 of 2
        .mockReturnValueOnce(of({
          content: users,
          totalElements: 25,
          totalPages: 2,
          number: 1,
          size: 20,
        } as Page<UserResponse>));

      fixture.detectChanges(); // loads first page

      // Navigate to next (last) page
      component.onNextPage();
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('.pagination-controls');
      const nextButton = pagination.querySelector('button[aria-label="Página siguiente"]');
      expect(nextButton.disabled).toBe(true);
    });
  });
});
