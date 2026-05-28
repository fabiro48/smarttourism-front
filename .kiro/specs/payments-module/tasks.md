# Implementation Plan: Payments Module

## Overview

Implement the Payments Module for the Smart Tourism frontend Angular application. The module provides tourists with a dedicated view to browse their payment history and initiate payments for pending reservations. The implementation builds on the existing `PaymentsService`, `PaymentResponse` model, and Angular standalone component patterns already established in the project.

## Tasks

- [x] 1. Extend PaymentsService with payment history method
  - [x] 1.1 Add `getMyPayments()` method to PaymentsService
    - Add a `getMyPayments(): Observable<PaymentResponse[]>` method that sends a GET request to `${this.baseUrl}/me`
    - The method returns an Observable of `PaymentResponse[]`; errors are propagated as-is (authInterceptor handles 401 globally)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.2 Write unit tests for PaymentsService
    - Test `getMyPayments()` sends GET to correct URL and returns `Observable<PaymentResponse[]>`
    - Test `simulatePayment()` sends POST to `/payments/simulate` with `{ reservationId }` body
    - Test that HTTP 404, 403, 422 errors are propagated correctly for `simulatePayment()`
    - Test that other HTTP errors preserve the original status code for both methods
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.3 Write property test for HTTP error propagation
    - **Property 6: HTTP error propagation preserves original status code**
    - Generate random HTTP status codes (excluding 401 for getMyPayments, excluding 403/404/422 for simulatePayment) and verify the service propagates errors preserving the original status code
    - **Validates: Requirements 4.7, 5.4**

- [x] 2. Create PaymentCardComponent
  - [x] 2.1 Scaffold PaymentCardComponent files
    - Create `src/app/features/payments/payment-card/payment-card.component.ts`, `.html`, `.scss`
    - Configure as standalone component with `@Input() payment: PaymentResponse`
    - Implement computed properties: `statusLabel` (APPROVED→"Aprobado", REJECTED→"Rechazado", PENDING→"Pendiente", EXPIRED→"Expirado"), `statusClass` (APPROVED→"status-approved", etc.), `displayTitle` (fallback to "Experiencia no disponible" for null/empty)
    - _Requirements: 2.1, 2.3, 2.4, 2.10_

  - [x] 2.2 Implement PaymentCardComponent template and styles
    - Render card with header (experience title + status badge), body (transaction details), following the same visual structure as ReservationCard
    - Display: experience title (or fallback), amount formatted as COP (`currency:'COP':'symbol-narrow':'1.0-0'`), status badge with localized label and CSS class, transaction reference (full string), createdAt formatted as `dd/MM/yyyy HH:mm`, reservationDate as `dd/MM/yyyy`, quantity as integer, experience location
    - Add `role="article"` with `aria-label` containing experience title and localized status label (e.g., "Pago de [title] - [statusLabel]")
    - Style status badges with distinct CSS classes ensuring WCAG 2.1 AA contrast ratio (4.5:1 minimum)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 7.2, 7.5, 8.2_

  - [ ]* 2.3 Write unit tests for PaymentCardComponent
    - Test renders experience title from input and fallback text for null/empty title
    - Test maps each PaymentStatus to correct localized label (4 cases)
    - Test maps each PaymentStatus to correct CSS class (4 cases)
    - Test formats amount as COP currency (e.g., 50000 → "$50.000")
    - Test formats createdAt as `dd/MM/yyyy HH:mm` and reservationDate as `dd/MM/yyyy`
    - Test displays transaction reference without truncation
    - Test has `role="article"` with correct `aria-label`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 7.2_

  - [ ]* 2.4 Write property test for COP currency formatting
    - **Property 3: COP currency formatting produces valid Colombian Peso representation**
    - Generate random non-negative integers and verify formatted output matches pattern: dollar sign prefix, digits grouped with period separators every three digits, no decimal places
    - **Validates: Requirements 2.2**

  - [ ]* 2.5 Write property test for date formatting correctness
    - **Property 4: Date formatting produces correct patterns**
    - Generate random valid ISO datetime strings, verify `dd/MM/yyyy HH:mm` output matches regex `\d{2}/\d{2}/\d{4} \d{2}:\d{2}` and components correspond to original values
    - Generate random valid ISO date strings, verify `dd/MM/yyyy` output matches regex `\d{2}/\d{2}/\d{4}`
    - **Validates: Requirements 2.6, 2.7**

  - [ ]* 2.6 Write property test for Payment_Card accessibility label
    - **Property 5: Payment_Card accessibility label contains title and status**
    - Generate random PaymentResponse objects, verify rendered component has `role="article"` and `aria-label` containing both the experience title (or fallback) and the localized status label
    - **Validates: Requirements 7.2**

- [x] 3. Checkpoint - Ensure service and card component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement PaymentsComponent (Payment_History_View)
  - [x] 4.1 Implement PaymentsComponent state management and data fetching
    - Refactor existing `PaymentsComponent` to use `ChangeDetectionStrategy.OnPush`
    - Inject `PaymentsService`, `ReservationsService`, `ChangeDetectorRef`
    - Implement state: `payments`, `pendingReservations`, `isLoading`, `errorMessage`, `paymentLoading`, `confirmPayId`, `paymentMessage`, `paymentMessageType`
    - On init: call `getMyPayments()` and `getMyReservations()`, set loading state, sort payments by `createdAt` descending, filter reservations with status `PENDING_PAYMENT`
    - Handle loading, error, and empty states
    - Implement retry mechanism via "Reintentar" button that re-invokes data loading
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.9_

  - [x] 4.2 Implement PaymentsComponent template - payment history section
    - Display loading indicator with text "Cargando..." while data loads
    - Set `aria-busy="true"` on `main` element during loading, remove/set to "false" when complete
    - Display empty state message "No tienes pagos registrados aún." when no payments
    - Display error message "Error al cargar el historial de pagos. Intenta de nuevo más tarde." with `role="alert"` on fetch failure
    - Display "Reintentar" button on error state
    - Render `app-payment-card` for each payment in the sorted list
    - Use CSS grid layout `repeat(auto-fill, minmax(320px, 1fr))` for card list
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.1, 7.3, 8.1, 8.3_

  - [x] 4.3 Implement PaymentsComponent template - pending reservations section
    - Display pending reservations section when tourist has PENDING_PAYMENT reservations
    - Show experience title, reservation date (`dd/MM/yyyy`), quantity, and total amount (COP format) for each pending reservation
    - Add "Pagar" button for each pending reservation
    - Hide section entirely when no PENDING_PAYMENT reservations exist
    - _Requirements: 3.1, 3.9_

  - [x] 4.4 Implement payment simulation flow (dialog, confirm, result handling)
    - On "Pagar" click: show confirmation dialog with `role="dialog"` and `aria-modal="true"`, displaying experience title and total amount
    - On cancel: close dialog, take no action
    - On confirm: call `simulatePayment(reservationId)`, disable "Pagar" button, show "Procesando..." spinner
    - On APPROVED response: show success message "Pago aprobado. Tu reserva está confirmada." with `role="alert"`, remove reservation from pending section, update local status to CONFIRMED, refresh payment history
    - On REJECTED response: show warning "El pago fue rechazado. Puedes intentarlo de nuevo." with `role="alert"`, re-enable button, keep reservation in pending section
    - On HTTP error: show error "Error al procesar el pago. Intenta de nuevo más tarde." with `role="alert"`, re-enable button
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 7.3, 7.4_

  - [x] 4.5 Implement PaymentsComponent styles
    - Follow same layout pattern as Reservations view with CSS grid `repeat(auto-fill, minmax(320px, 1fr))`
    - Ensure responsive behavior: single column below 320px, multiple columns as viewport increases
    - Style confirmation dialog, feedback messages, and loading states
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 4.6 Write unit tests for PaymentsComponent
    - Test shows loading indicator while fetching
    - Test shows empty state when no payments returned
    - Test shows error message with `role="alert"` on fetch failure
    - Test shows "Reintentar" button on error and re-triggers fetch on click
    - Test renders correct number of PaymentCardComponents
    - Test sorts payments by createdAt descending
    - Test shows pending reservations section when PENDING_PAYMENT exists
    - Test hides pending section when no PENDING_PAYMENT reservations
    - Test opens confirmation dialog on "Pagar" click
    - Test closes dialog on cancel without HTTP call
    - Test disables button and shows spinner during payment processing
    - Test shows success message on APPROVED response and refreshes history
    - Test shows warning message on REJECTED response
    - Test shows error message on HTTP failure
    - Test sets `aria-busy` on main during loading
    - Test dialog has `role="dialog"` and `aria-modal="true"`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 7.1, 7.3, 7.4_

  - [ ]* 4.7 Write property test for payment history sort order
    - **Property 1: Payment history is sorted by creation date descending**
    - Generate random arrays of PaymentResponse with varying `createdAt` timestamps, verify the component sorts them so each payment's `createdAt` is greater than or equal to the next
    - **Validates: Requirements 1.5**

  - [ ]* 4.8 Write property test for Payment_Card renders all required fields
    - **Property 2: Payment_Card renders all required data fields**
    - Generate random valid PaymentResponse objects with non-null experienceTitle, verify rendered PaymentCardComponent output contains experienceTitle, transactionReference (full string), quantity (as integer), and experienceLocation
    - **Validates: Requirements 2.1, 2.5, 2.8, 2.9, 1.4**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Routing and integration wiring
  - [x] 6.1 Verify routing configuration and lazy loading
    - Confirm `app.routes.ts` has the `/payments` route with `authGuard` and `loadChildren` pointing to `paymentsRoutes` (already configured)
    - Confirm `payments.routes.ts` has the empty path child route rendering `PaymentsComponent` (already configured)
    - Ensure PaymentCardComponent is imported in PaymentsComponent's `imports` array
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 6.2 Write integration tests for routing
    - Test route `/payments` renders PaymentsComponent when authenticated
    - Test route `/payments` redirects to `/auth/login` when unauthenticated
    - Test lazy loading configuration works correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases using Vitest + Angular TestBed
- The existing `PaymentsService.simulatePayment()` method and `PaymentResponse` model are reused without modification
- The routing and authGuard configuration already exists in `app.routes.ts` — task 6.1 verifies and wires the component imports
- COP currency formatting uses Angular's `CurrencyPipe` with format `currency:'COP':'symbol-narrow':'1.0-0'`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "2.6"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5"] },
    { "id": 6, "tasks": ["4.6", "4.7", "4.8"] },
    { "id": 7, "tasks": ["6.1"] },
    { "id": 8, "tasks": ["6.2"] }
  ]
}
```
