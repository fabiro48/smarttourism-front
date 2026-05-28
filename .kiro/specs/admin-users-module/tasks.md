# Implementation Plan: Admin Users Module

## Overview

Implementación del Módulo de Administración de Usuarios para el frontend Angular de Smart Tourism. El plan sigue un enfoque incremental: primero los modelos de datos e interfaces, luego el servicio HTTP, después el componente principal con tabla y paginación, la actualización del dashboard, la configuración de rutas, y finalmente los tests. Cada paso construye sobre el anterior para evitar código huérfano.

## Tasks

- [x] 1. Set up data models and shared interfaces
  - [x] 1.1 Create UserResponse and UpdateUserStatusRequest interfaces
    - Create file `src/app/features/admin/models/user-admin.model.ts`
    - Define `UserResponse` interface with fields: id, fullName, email, phone, documentNumber, role, active, createdAt, updatedAt
    - Define `UpdateUserStatusRequest` interface with field: active (boolean)
    - Import `UserRole` from `../../../core/models/user.model`
    - Ensure `Page<T>` is importable from `../../reservations/models/reservation.model`
    - _Requirements: 1.1, 1.2_

- [x] 2. Implement AdminUsersService
  - [x] 2.1 Create AdminUsersService with HTTP methods
    - Create file `src/app/features/admin/services/admin-users.service.ts`
    - Implement `@Injectable({ providedIn: 'root' })` service with `inject(HttpClient)`
    - Implement `getUsers(page: number, size: number): Observable<Page<UserResponse>>` that performs GET to `${environment.apiUrl}/admin/users` with query params `page` and `size`
    - Implement `updateUserStatus(userId: string, active: boolean): Observable<UserResponse>` that performs PATCH to `${environment.apiUrl}/admin/users/${userId}/status` with body `{ active }`
    - Propagate HTTP errors without transformation
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x]* 2.2 Write property test for AdminUsersService — URL construction (Property 1)
    - **Property 1: Construcción correcta de URL para getUsers**
    - Create test file `src/app/features/admin/services/admin-users.service.spec.ts`
    - Use `fast-check` with `fc.nat()` for page and `fc.integer({ min: 1 })` for size
    - Verify that for any valid page (>= 0) and size (> 0), the GET request URL contains correct `page` and `size` query params
    - Use `HttpClientTestingModule` to intercept and verify requests
    - Run with `{ numRuns: 100 }`
    - **Validates: Requirements 1.1, 9.4**

  - [x]* 2.3 Write property test for AdminUsersService — PATCH request construction (Property 2)
    - **Property 2: Construcción correcta de petición PATCH para updateUserStatus**
    - Use `fast-check` with `fc.uuid()` for userId and `fc.boolean()` for active
    - Verify that for any non-empty userId and boolean active, the PATCH request targets `/admin/users/{userId}/status` with body `{ active: <value> }`
    - Run with `{ numRuns: 100 }`
    - **Validates: Requirements 1.2, 9.2**

  - [x]* 2.4 Write unit tests for AdminUsersService
    - Test that `getUsers(0, 20)` performs GET to correct URL with params
    - Test that `updateUserStatus('uuid', true)` performs PATCH to correct URL with body
    - Test that HTTP errors are propagated to subscriber
    - Test that base URL uses `environment.apiUrl`
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 3. Checkpoint - Verify service layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement AdminUsersComponent
  - [x] 4.1 Create AdminUsersComponent with table, loading, error, and empty states
    - Create files: `admin-users.component.ts`, `admin-users.component.html`, `admin-users.component.scss` in `src/app/features/admin/admin-users/`
    - Implement standalone component with `ChangeDetectionStrategy.OnPush`
    - Inject `AdminUsersService` and `ChangeDetectorRef` using `inject()`
    - Implement `ngOnInit` to call `getUsers(0, 20)` and populate the table
    - Render semantic `<table>` with `<thead>`, `<tbody>`, `<th>`, `<td>` and `aria-label="Lista de usuarios"`
    - Display columns: fullName, email, phone, role, active status badge, createdAt (formatted)
    - Show loading indicator with text "Cargando..." while request is in progress
    - Show "No se encontraron usuarios registrados" when list is empty
    - Show "Error al cargar los usuarios. Intenta de nuevo más tarde" with `role="alert"` on error
    - Style with design system variables: `--color-surface`, `--radius-card`, `--color-border`, `--color-success`, `--color-error`, `--color-text`, `--color-muted`
    - Status badge with `aria-label` "Estado: Activo" or "Estado: Inactivo"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.5, 6.7, 7.1, 7.2, 7.3, 7.7, 8.1_

  - [x] 4.2 Implement pagination controls in AdminUsersComponent
    - Add "Anterior" and "Siguiente" buttons below the table
    - Show pagination controls only when `totalElements > pageSize`
    - Display current page indicator (e.g., "Página 1 de 5")
    - Disable "Anterior" button when `currentPage === 0`
    - Disable "Siguiente" button when `currentPage === totalPages - 1`
    - On "Siguiente" click, call `getUsers(currentPage + 1, pageSize)`
    - On "Anterior" click, call `getUsers(currentPage - 1, pageSize)`
    - Add `aria-label="Página anterior"` and `aria-label="Página siguiente"` to buttons
    - Style buttons with `--color-primary` and `border-radius: var(--radius-control)`
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 6.3, 7.4_

  - [x] 4.3 Implement status toggle with confirmation dialog
    - Import and use existing `ConfirmationDialogComponent`
    - Add action button per row: "Desactivar" for active users, "Activar" for inactive users
    - Add `aria-label` to each action button (e.g., "Desactivar usuario Juan Pérez")
    - On button click, show `ConfirmationDialogComponent` with title and message indicating action and user name
    - On confirm: set `isProcessing=true`, call `updateUserStatus(userId, !active)`
    - On success: update user in local array (find by id, update active field), close dialog, `markForCheck()`
    - On 404 error: show "Usuario no encontrado", close dialog
    - On other error: show "Error al actualizar el estado del usuario. Intenta de nuevo más tarde", close dialog
    - On cancel: close dialog without making any request
    - Maintain table visible with previously loaded data after any error
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.4, 8.2, 8.3, 8.4_

- [x] 5. Checkpoint - Verify component implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update AdminComponent dashboard and routes
  - [x] 6.1 Update AdminComponent as navigation dashboard
    - Modify existing `src/app/features/admin/admin/admin.component.html` and `.scss`
    - Add heading "Panel de Administración"
    - Add navigation cards using `<nav aria-label="Navegación de administración">`
    - Create card for "Gestión de Usuarios" with `routerLink="/admin/users"` and brief description
    - Create card for "Gestión de Reservas" with `routerLink="/admin/reservations"` and brief description
    - Import `RouterLink` in the component
    - Style cards with `--color-surface`, `--radius-card`, `--color-primary` for titles
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.6, 7.5, 7.6_

  - [x] 6.2 Add route for AdminUsersComponent in admin.routes.ts
    - Modify `src/app/features/admin/admin.routes.ts`
    - Add route `{ path: 'users', component: AdminUsersComponent }`
    - Verify existing routes for `''` (AdminComponent) and `reservations` (AdminReservationsComponent) remain unchanged
    - _Requirements: 5.1, 5.2_

- [x] 7. Write component tests
  - [x]* 7.1 Write property test for AdminUsersComponent — Rendering completeness (Property 3)
    - **Property 3: Completitud de renderizado de filas de usuario**
    - Use `fast-check` with `userListArb` (array of UserResponse, minLength: 1, maxLength: 50)
    - Verify that for any non-empty list of users, the table renders one row per user with fullName, email, phone, role, and active status
    - Use `TestBed` with mocked `AdminUsersService`
    - Run with `{ numRuns: 100 }`
    - **Validates: Requirements 2.2, 10.4**

  - [x]* 7.2 Write property test for AdminUsersComponent — Active state UI consistency (Property 4)
    - **Property 4: Consistencia de UI con el estado activo del usuario**
    - Use `fast-check` with `userResponseArb`
    - Verify that for any user, the action button shows "Desactivar" if active=true and "Activar" if active=false
    - Verify the status badge aria-label matches "Estado: Activo" or "Estado: Inactivo" accordingly
    - Run with `{ numRuns: 100 }`
    - **Validates: Requirements 3.1, 6.7**

  - [x]* 7.3 Write unit tests for AdminUsersComponent
    - Create test file `src/app/features/admin/admin-users/admin-users.component.spec.ts`
    - Test loading indicator is shown while request is in progress
    - Test empty list message when no users returned
    - Test error message display when backend returns error
    - Test clicking action button shows ConfirmationDialog with correct message
    - Test confirming action updates user status in table
    - Test pagination controls shown when totalElements > 20
    - Test "Anterior" button disabled on first page
    - Test "Siguiente" button disabled on last page
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6, 10.7, 10.8_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Angular standalone components with OnPush change detection
- `fast-check` (^3.22.0) is already installed in the project
- The existing `ConfirmationDialogComponent` and `Page<T>` interface are reused
- All styles use the project's CSS design system variables

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["6.1", "6.2"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] }
  ]
}
```
