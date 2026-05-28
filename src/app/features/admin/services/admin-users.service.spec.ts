import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import fc from 'fast-check';
import { AdminUsersService } from './admin-users.service';
import { environment } from '../../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/admin/users`;

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminUsersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AdminUsersService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── Property Tests ──────────────────────────────────────────────────────────

  describe('Property Tests', () => {
    // Feature: admin-users-module, Property 1: Construcción correcta de URL para getUsers
    // **Validates: Requirements 1.1, 9.4**
    it('Property 1: URL construction for getUsers', () => {
      fc.assert(
        fc.property(
          fc.nat(),                    // page >= 0
          fc.integer({ min: 1 }),      // size > 0
          (page: number, size: number) => {
            service.getUsers(page, size).subscribe();

            const req = httpTesting.expectOne(
              r => r.method === 'GET' && r.url === BASE_URL
            );

            expect(req.request.params.get('page')).toBe(String(page));
            expect(req.request.params.get('size')).toBe(String(size));

            req.flush({ content: [], totalElements: 0, totalPages: 0, number: page, size });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: admin-users-module, Property 2: Construcción correcta de petición PATCH para updateUserStatus
    // **Validates: Requirements 1.2, 9.2**
    it('Property 2: PATCH request construction for updateUserStatus', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.boolean(),
          (userId: string, active: boolean) => {
            service.updateUserStatus(userId, active).subscribe();

            const expectedUrl = `${BASE_URL}/${userId}/status`;
            const req = httpTesting.expectOne(expectedUrl);

            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual({ active });

            req.flush({
              id: userId,
              fullName: 'Test User',
              email: 'test@example.com',
              phone: '1234567',
              documentNumber: '12345',
              role: 'TOURIST',
              active,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ─── Unit Tests ──────────────────────────────────────────────────────────────

  describe('getUsers()', () => {
    it('performs GET to correct URL with page and size params', () => {
      service.getUsers(0, 20).subscribe();

      const req = httpTesting.expectOne(
        r => r.method === 'GET' && r.url === BASE_URL
      );

      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('20');

      req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
    });

    it('uses environment.apiUrl as base URL', () => {
      service.getUsers(0, 10).subscribe();

      const req = httpTesting.expectOne(
        r => r.url === `${environment.apiUrl}/admin/users`
      );

      expect(req.request.url).toBe(`${environment.apiUrl}/admin/users`);

      req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
    });
  });

  describe('updateUserStatus()', () => {
    it('performs PATCH to correct URL with body', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      service.updateUserStatus(userId, true).subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/${userId}/status`);

      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ active: true });

      req.flush({
        id: userId,
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567',
        documentNumber: '12345',
        role: 'TOURIST',
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });
  });

  describe('Error propagation', () => {
    it('propagates HTTP errors to subscriber on getUsers', () => {
      let errorResponse: any;
      let nextCalled = false;

      service.getUsers(0, 20).subscribe({
        next: () => { nextCalled = true; },
        error: (err) => { errorResponse = err; },
      });

      const req = httpTesting.expectOne(
        r => r.method === 'GET' && r.url === BASE_URL
      );
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(nextCalled).toBe(false);
      expect(errorResponse).toBeTruthy();
      expect(errorResponse.status).toBe(500);
    });

    it('propagates HTTP errors to subscriber on updateUserStatus', () => {
      let errorResponse: any;
      let nextCalled = false;

      service.updateUserStatus('user-1', false).subscribe({
        next: () => { nextCalled = true; },
        error: (err) => { errorResponse = err; },
      });

      const req = httpTesting.expectOne(`${BASE_URL}/user-1/status`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(nextCalled).toBe(false);
      expect(errorResponse).toBeTruthy();
      expect(errorResponse.status).toBe(404);
    });
  });
});
