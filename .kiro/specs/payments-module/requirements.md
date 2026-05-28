# Requirements Document

## Introduction

The Payments Module provides tourists with the ability to simulate payments for their pending reservations and view their payment history within the Smart Tourism frontend application. The module integrates with the existing backend payment simulation endpoint (`POST /api/v1/payments/simulate`) and follows the established Angular standalone component patterns used across the application. Currently, payment simulation is triggered from the Reservations view; this module adds a dedicated Payments section where tourists can review past payment transactions and initiate payments from a centralized location.

## Glossary

- **Payments_Module**: The Angular feature module located at `src/app/features/payments/` responsible for payment-related views and logic.
- **Payments_Service**: The Angular injectable service (`PaymentsService`) that communicates with the backend payment API endpoints.
- **Payment_History_View**: The main component of the Payments Module that displays a list of past payment transactions for the authenticated tourist.
- **Payment_Card**: A presentational component that renders individual payment transaction details in a card format.
- **Payment_Simulation**: The process of sending a payment request to the backend (`POST /api/v1/payments/simulate`) and receiving an APPROVED or REJECTED result.
- **Tourist**: An authenticated user with the TOURIST role who can make reservations and payments.
- **PaymentStatus**: An enumeration with values PENDING, APPROVED, REJECTED, and EXPIRED representing the state of a payment.
- **ReservationStatus**: An enumeration with values PENDING_PAYMENT, CONFIRMED, CANCELLED, EXPIRED, and NO_SHOW representing the state of a reservation.
- **PaymentResponse**: The data transfer object returned by the backend containing payment details, transaction reference, amount, and associated reservation information.

## Requirements

### Requirement 1: Display Payment History

**User Story:** As a tourist, I want to view my payment history, so that I can track all payment transactions I have made for my reservations.

#### Acceptance Criteria

1. WHEN the tourist navigates to the Payments route (`/payments`), THE Payment_History_View SHALL display a list of all payment transactions associated with the authenticated tourist by invoking the Payments_Service payment history method.
2. WHILE the payment history data is loading from the backend, THE Payment_History_View SHALL display a loading indicator with the text "Cargando..." and prevent user interaction with the payment list area.
3. WHEN the backend returns an empty list of payments, THE Payment_History_View SHALL display an empty state message with the text "No tienes pagos registrados aún." visible to the tourist.
4. WHEN the backend returns a non-empty list of payments, THE Payment_History_View SHALL render one Payment_Card component for each payment transaction in the response array.
5. THE Payment_History_View SHALL sort payment transactions by the `createdAt` field in descending order, showing the most recent payments first.
6. IF the backend request to retrieve payment history fails, THEN THE Payment_History_View SHALL display an error message "Error al cargar el historial de pagos. Intenta de nuevo más tarde." with an alert role for accessibility, and SHALL hide the loading indicator.
7. IF the backend request to retrieve payment history fails, THEN THE Payment_History_View SHALL display a "Reintentar" button that allows the tourist to re-trigger the payment history request.

### Requirement 2: Payment Card Display

**User Story:** As a tourist, I want to see detailed information about each payment transaction, so that I can understand the outcome and details of each payment.

#### Acceptance Criteria

1. THE Payment_Card SHALL receive a PaymentResponse object as input and display the experience title associated with the payment.
2. THE Payment_Card SHALL display the payment amount formatted as Colombian Pesos with the dollar sign prefix, period as thousands separator, and no decimal places (e.g., "$50.000" for 50000 COP).
3. THE Payment_Card SHALL display the payment status with a localized label: "Aprobado" for APPROVED, "Rechazado" for REJECTED, "Pendiente" for PENDING, and "Expirado" for EXPIRED.
4. THE Payment_Card SHALL display a visual status badge with distinct CSS classes: `status-approved` for APPROVED, `status-rejected` for REJECTED, `status-pending` for PENDING, and `status-expired` for EXPIRED.
5. THE Payment_Card SHALL display the transaction reference identifier as the full string value returned by the backend without truncation.
6. THE Payment_Card SHALL display the payment creation date formatted as `dd/MM/yyyy HH:mm`.
7. THE Payment_Card SHALL display the reservation date formatted as `dd/MM/yyyy`.
8. THE Payment_Card SHALL display the number of reserved slots as an integer quantity value.
9. THE Payment_Card SHALL display the experience location associated with the payment.
10. IF the PaymentResponse contains a null or empty experience title, THEN THE Payment_Card SHALL display a fallback text "Experiencia no disponible" in place of the title.

### Requirement 3: Initiate Payment from Payments View

**User Story:** As a tourist, I want to initiate a payment for a pending reservation from the payments section, so that I have a centralized place to manage my payments.

#### Acceptance Criteria

1. WHEN the Payment_History_View loads and the tourist has reservations in PENDING_PAYMENT status, THE Payment_History_View SHALL display a section listing reservations available for payment, showing for each reservation the experience title, reservation date formatted as `dd/MM/yyyy`, quantity of reserved slots, and total amount formatted as Colombian Pesos (COP) with no decimal places.
2. WHEN the tourist clicks the "Pagar" button on a pending reservation, THE Payments_Module SHALL display a confirmation dialog asking the tourist to confirm the payment, including the experience title and total amount of the selected reservation.
3. WHEN the tourist confirms the payment in the dialog, THE Payments_Service SHALL send a POST request to `/api/v1/payments/simulate` with the reservation ID in the request body.
4. WHEN the tourist cancels or dismisses the confirmation dialog, THE Payments_Module SHALL close the dialog and take no further action, leaving the reservation in its current state.
5. WHILE the payment simulation request is in progress, THE Payment_History_View SHALL disable the "Pagar" button for the selected reservation and display a loading spinner with the text "Procesando...".
6. WHEN the backend returns a PaymentResponse with paymentStatus APPROVED, THE Payment_History_View SHALL re-enable the payment button area, display a success message "Pago aprobado. Tu reserva está confirmada.", remove the reservation from the pending payments section, update the local reservation status to CONFIRMED, and refresh the payment history list.
7. WHEN the backend returns a PaymentResponse with paymentStatus REJECTED, THE Payment_History_View SHALL re-enable the "Pagar" button, display a warning message "El pago fue rechazado. Puedes intentarlo de nuevo.", and keep the reservation in the pending payments section with PENDING_PAYMENT status.
8. IF the payment simulation request fails with an HTTP error, THEN THE Payment_History_View SHALL re-enable the "Pagar" button and display an error message "Error al procesar el pago. Intenta de nuevo más tarde.".
9. IF the tourist has no reservations in PENDING_PAYMENT status, THEN THE Payment_History_View SHALL hide the pending payments section entirely.

### Requirement 4: Payment Service API Integration

**User Story:** As a developer, I want the Payments Service to correctly integrate with the backend API, so that payment operations are reliable and consistent.

#### Acceptance Criteria

1. THE Payments_Service SHALL send payment simulation requests to the URL `${environment.apiUrl}/payments/simulate` using HTTP POST method with `Content-Type: application/json` header.
2. THE Payments_Service SHALL include the reservation ID in the request body as a JSON object with the field `reservationId` containing a UUID string value.
3. THE Payments_Service SHALL return an Observable of type PaymentResponse containing all fields: id (UUID), paymentStatus (PaymentStatus enum), transactionReference (string), amount (number), reservationId (UUID), reservationStatus (ReservationStatus enum), touristId (UUID), touristName (string), touristEmail (string), experienceId (UUID), experienceTitle (string), experienceLocation (string), reservationDate (ISO date string), quantity (integer), totalAmount (number), expirationDate (ISO datetime string), and createdAt (ISO datetime string).
4. WHEN the backend returns HTTP 404, THE Payments_Service SHALL propagate the error as an Observable error with the HTTP status code and a message indicating the reservation was not found.
5. WHEN the backend returns HTTP 403, THE Payments_Service SHALL propagate the error as an Observable error with the HTTP status code and a message indicating the tourist does not own the reservation.
6. WHEN the backend returns HTTP 422, THE Payments_Service SHALL propagate the error as an Observable error with the HTTP status code and a message indicating the reservation is not in a payable state.
7. IF the backend returns an HTTP error status other than 403, 404, or 422, THEN THE Payments_Service SHALL propagate the error as an Observable error preserving the original HTTP status code and error body.

### Requirement 5: Payment History Service Endpoint

**User Story:** As a developer, I want a service method to retrieve the tourist's payment history, so that the Payment History View can display past transactions.

#### Acceptance Criteria

1. THE Payments_Service SHALL provide a method to retrieve all payments for the authenticated tourist by sending a GET request to `${environment.apiUrl}/payments/me`.
2. THE Payments_Service SHALL return an Observable of type PaymentResponse array from the payment history endpoint, where an empty array is returned when the tourist has no payment transactions.
3. WHEN the backend returns HTTP 401, THE Payments_Service SHALL propagate the authentication error as an Observable error to be handled by the auth interceptor.
4. IF the backend returns an HTTP error status other than 401, THEN THE Payments_Service SHALL propagate the error as an Observable error preserving the original HTTP status code and error body.

### Requirement 6: Routing and Navigation

**User Story:** As a tourist, I want to access the payments section from the application navigation, so that I can easily find my payment history.

#### Acceptance Criteria

1. WHEN the tourist navigates to `/payments`, THE Payments_Module SHALL render the Payment_History_View component as the default route (empty path child route).
2. THE Payments_Module SHALL be protected by the `authGuard` in the application routes configuration, requiring the tourist to be logged in before accessing any payments route.
3. THE Payments_Module SHALL use lazy loading via `loadChildren` in the application routes configuration, importing the payments routes from the payments feature module.
4. IF an unauthenticated user navigates to `/payments`, THEN THE `authGuard` SHALL redirect the user to the authentication route before rendering the Payment_History_View.

### Requirement 7: Accessibility Compliance

**User Story:** As a tourist using assistive technology, I want the payments module to be accessible, so that I can use all payment features regardless of my abilities.

#### Acceptance Criteria

1. WHILE payment history data is loading, THE Payment_History_View SHALL set the `aria-busy` attribute on the `main` element to "true", and SHALL remove the attribute or set it to "false" when loading completes.
2. THE Payment_Card SHALL use a `role="article"` attribute with an `aria-label` containing the experience title and the localized payment status label (e.g., "Pago de [experienceTitle] - [statusLabel]").
3. WHEN a feedback message is displayed (success, warning, or error), THE Payment_History_View SHALL use `role="alert"` to announce the message to screen readers.
4. THE confirmation dialog SHALL use `role="dialog"` and `aria-modal="true"` attributes.
5. THE Payment_Card status badge SHALL meet WCAG 2.1 Level AA contrast ratio (minimum 4.5:1 for normal text) and SHALL include text labels, avoiding reliance on color alone to convey payment status.

### Requirement 8: Responsive Design and Visual Consistency

**User Story:** As a tourist, I want the payments module to look consistent with the rest of the application, so that I have a cohesive user experience.

#### Acceptance Criteria

1. THE Payment_History_View SHALL follow the same layout pattern used in the Reservations view, using a CSS grid with `repeat(auto-fill, minmax(320px, 1fr))` for the card-based list layout.
2. THE Payment_Card SHALL follow the same visual structure as the Reservation_Card component, including a header section with experience title and status badge, a body section with transaction details, and an optional actions section with buttons separated by a top border.
3. THE Payment_History_View SHALL be responsive, displaying cards in a single column when the viewport width is below 320px and expanding to multiple columns as viewport width increases, using the auto-fill grid behavior.
