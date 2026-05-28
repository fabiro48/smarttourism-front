# Implementation Plan: Módulo de Reservas

## Overview

Implementación del módulo de reservas para el frontend Angular de Smart Tourism. El plan cubre la creación de modelos, servicios HTTP, componentes de UI (listado, tarjeta, formulario, panel admin), configuración de rutas, y tests unitarios/de propiedad. Se sigue el patrón existente del proyecto: standalone components, servicios con `inject()`, reactive forms, y design system con variables CSS.

## Tasks

- [x] 1. Crear modelos de datos e interfaces
  - [x] 1.1 Crear el archivo `src/app/features/reservations/models/reservation.model.ts` con las interfaces y tipos
    - Definir `ReservationStatus`, `PaymentStatus` como union types
    - Definir `ReservationRequest`, `ReservationResponse`, `PaymentResponse`, `AdminReservationFilters`
    - Definir `Page<T>` interface genérica de paginación
    - _Requirements: 1.1, 2.1, 8.1_

- [x] 2. Implementar servicios HTTP
  - [x] 2.1 Crear `ReservationsService` en `src/app/features/reservations/services/reservations.service.ts`
    - Implementar `createReservation(request: ReservationRequest): Observable<ReservationResponse>` con POST a `/api/v1/reservations`
    - Implementar `getMyReservations(): Observable<ReservationResponse[]>` con GET a `/api/v1/reservations/me`
    - Implementar `cancelReservation(id: string): Observable<void>` con PATCH a `/api/v1/reservations/{id}/cancel`
    - Implementar `getAdminReservations(filters, page, size): Observable<Page<ReservationResponse>>` con GET a `/api/v1/admin/reservations`
    - Propagar errores HTTP sin transformarlos
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.4_

  - [x] 2.2 Crear `PaymentsService` en `src/app/features/payments/services/payments.service.ts`
    - Implementar `simulatePayment(reservationId: string): Observable<PaymentResponse>` con POST a `/api/v1/payments/simulate` y body `{ reservationId }`
    - Propagar errores HTTP sin transformarlos
    - _Requirements: 2.1, 2.2_

  - [ ]* 2.3 Escribir tests unitarios para `ReservationsService` en `reservations.service.spec.ts`
    - Test: `createReservation` realiza POST a URL correcta con body correcto
    - Test: `getMyReservations` realiza GET a `/api/v1/reservations/me`
    - Test: `cancelReservation(id)` realiza PATCH a `/api/v1/reservations/{id}/cancel`
    - Test: errores HTTP se propagan correctamente
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 2.4 Escribir test de propiedad P1 para `ReservationsService`
    - **Property 1: Completitud del request body de reserva**
    - Generar `ReservationRequest` aleatorios con fast-check y verificar que el POST body contiene exactamente los 4 campos con sus valores originales
    - **Validates: Requirements 1.1, 12.4**

  - [ ]* 2.5 Escribir test de propiedad P6 para `ReservationsService`
    - **Property 6: Construcción de request de filtros admin**
    - Generar `AdminReservationFilters` aleatorios con campos null/non-null y verificar que solo los no-null se incluyen como query params
    - **Validates: Requirements 8.4**

  - [ ]* 2.6 Escribir tests unitarios para `PaymentsService` en `payments.service.spec.ts`
    - Test: `simulatePayment(reservationId)` realiza POST a `/api/v1/payments/simulate` con body `{ reservationId }`
    - Test: errores HTTP se propagan correctamente al consumidor
    - _Requirements: 13.1, 13.2_

- [x] 3. Checkpoint - Verificar servicios
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar componente ReservationCard
  - [x] 4.1 Crear `ReservationCardComponent` en `src/app/features/reservations/reservation-card/`
    - Crear componente standalone con `@Input() reservation`, `@Input() paymentLoading`, `@Input() cancelLoading`, `@Output() pay`, `@Output() cancel`
    - Mostrar: `experienceTitle`, `experienceLocation`, fecha formateada (dd/MM/yyyy), `quantity`, `totalAmount` en COP
    - Mostrar etiqueta de estado con colores del design system: `PENDING_PAYMENT` → `var(--color-accent)`, `CONFIRMED` → `var(--color-success)`, `CANCELLED` → `var(--color-muted)`, `EXPIRED`/`NO_SHOW` → `var(--color-error)`
    - Mostrar botón "Pagar" solo si estado es `PENDING_PAYMENT`
    - Mostrar fecha de expiración si estado es `PENDING_PAYMENT`
    - Mostrar botón "Cancelar" solo si estado es `PENDING_PAYMENT` o `CONFIRMED`
    - Deshabilitar botones y mostrar indicador de carga según `paymentLoading`/`cancelLoading`
    - Aplicar `role="article"` y `aria-label="Reserva de {título} - {estado}"` en el elemento raíz
    - Usar variables CSS del design system: `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 9.2, 9.4, 10.2, 10.3_

  - [ ]* 4.2 Escribir tests unitarios para `ReservationCardComponent`
    - Test: título, ubicación, fecha, cantidad y monto se renderizan correctamente
    - Test: botón "Pagar" solo visible con estado `PENDING_PAYMENT`
    - Test: botón "Cancelar" visible con `PENDING_PAYMENT` o `CONFIRMED`
    - Test: sin botones de acción para `CANCELLED`, `EXPIRED`, `NO_SHOW`
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 4.3 Escribir test de propiedad P3 para `ReservationCardComponent`
    - **Property 3: Formato de monto en COP**
    - Generar `totalAmount` positivos aleatorios y verificar que el valor mostrado está formateado correctamente como peso colombiano
    - **Validates: Requirements 4.5, 15.5**

  - [ ]* 4.4 Escribir test de propiedad P4 para `ReservationCardComponent`
    - **Property 4: Visibilidad de botones de acción según estado**
    - Generar `ReservationStatus` aleatorios y verificar presencia/ausencia de botones "Pagar" y "Cancelar" según las reglas
    - **Validates: Requirements 4.7, 4.9, 15.2, 15.3, 15.4**

- [x] 5. Implementar componente ReservationsList (turista)
  - [x] 5.1 Refactorizar `ReservationsComponent` existente en `src/app/features/reservations/reservations/`
    - Inyectar `ReservationsService` y `PaymentsService`
    - Implementar `loadReservations()` en `ngOnInit` con estados de carga y error
    - Renderizar lista de `app-reservation-card` con los datos
    - Mostrar mensaje "No tienes reservas aún. ¡Explora las experiencias disponibles!" con enlace a `/experiences` si lista vacía
    - Mostrar mensaje de error "Error al cargar tus reservas. Intenta de nuevo más tarde" si falla la petición
    - Mostrar indicador de carga con `aria-busy="true"` mientras carga
    - Agregar `<h1>Mis Reservas</h1>` como encabezado principal
    - Usar `var(--color-bg)` como fondo de página y `var(--color-primary)` + `var(--radius-control)` para botones
    - Usar `ChangeDetectionStrategy.OnPush`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.6, 10.1, 10.4_

  - [x] 5.2 Implementar flujo de simulación de pago en `ReservationsComponent`
    - Implementar diálogo de confirmación inline con texto "¿Confirmar pago de {totalAmount} COP para {experienceTitle}?" con `role="dialog"` y `aria-modal="true"`
    - Al confirmar, llamar a `PaymentsService.simulatePayment(reservationId)`
    - Si `paymentStatus === 'APPROVED'`: mostrar mensaje de éxito y actualizar estado local a `CONFIRMED`
    - Si `paymentStatus === 'REJECTED'`: mostrar advertencia "El pago fue rechazado. Puedes intentarlo de nuevo."
    - Si error HTTP: mostrar "Error al procesar el pago. Intenta de nuevo más tarde."
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.8_

  - [x] 5.3 Implementar flujo de cancelación en `ReservationsComponent`
    - Implementar diálogo de confirmación inline con texto "¿Cancelar esta reserva? Esta acción no se puede deshacer." con `role="dialog"` y `aria-modal="true"`
    - Al confirmar, llamar a `ReservationsService.cancelReservation(id)`
    - Si éxito (204): actualizar estado local a `CANCELLED` sin recargar
    - Si error HTTP: mostrar "Error al cancelar la reserva. Intenta de nuevo más tarde."
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.8_

  - [ ]* 5.4 Escribir tests unitarios para `ReservationsComponent`
    - Test: al inicializar se realiza petición al backend
    - Test: mensaje de lista vacía cuando backend retorna array vacío
    - Test: mensaje de error cuando backend retorna error HTTP
    - Test: al confirmar pago se realiza POST a `/api/v1/payments/simulate`
    - Test: al confirmar cancelación se realiza PATCH a `/api/v1/reservations/{id}/cancel`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 5.5 Escribir test de propiedad P2 para `ReservationsComponent`
    - **Property 2: Completitud de renderizado de reservas**
    - Generar arrays de `ReservationResponse` no vacíos y verificar que se renderizan exactamente N `app-reservation-card` elementos
    - **Validates: Requirements 3.2, 14.6**

- [x] 6. Checkpoint - Verificar listado y acciones del turista
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implementar componente ReservationForm
  - [x] 7.1 Crear `ReservationFormComponent` en `src/app/features/reservations/reservation-form/`
    - Crear componente standalone con reactive form (`FormGroup`)
    - Leer query params `experienceId` y `scheduleId` en `ngOnInit` para pre-seleccionar
    - Campo `reservationDate`: solo fechas futuras (validación custom)
    - Campo `quantity`: mínimo 1 (Validators.min(1))
    - Mostrar resumen con nombre de experiencia, horario y precio unitario
    - Al enviar: llamar `ReservationsService.createReservation()` y navegar a `/reservations` tras éxito
    - Mostrar error descriptivo si falla, mantener datos del formulario
    - Deshabilitar botón de envío y mostrar carga mientras se envía, con `aria-disabled="true"`
    - Asociar `<label>` con cada campo mediante atributo `for`
    - Usar variables CSS del design system: `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)`, `var(--color-error)` para errores
    - Usar `ChangeDetectionStrategy.OnPush`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.3, 9.5, 10.5, 10.6_

  - [ ]* 7.2 Escribir test de propiedad P5 para `ReservationFormComponent`
    - **Property 5: Validación del formulario de reserva**
    - Generar fechas pasadas y verificar que `reservationDate` se marca inválido; generar cantidades < 1 y verificar que `quantity` se marca inválido
    - **Validates: Requirements 5.2, 5.3**

- [x] 8. Implementar componente AdminReservationsList
  - [x] 8.1 Crear `AdminReservationsComponent` en `src/app/features/admin/admin-reservations/`
    - Crear componente standalone con `ChangeDetectionStrategy.OnPush`
    - Implementar `loadReservations()` con paginación (page 0, size 20 por defecto)
    - Selector de filtro por estado: "Todos los estados", "Pendiente de pago", "Confirmada", "Cancelada", "Expirada", "No asistió"
    - Campos de fecha para filtro por rango (fecha inicio, fecha fin)
    - Al modificar filtros: nueva petición con filtros activos y reset a página 0
    - Mostrar tabla con: nombre turista, email, título experiencia, fecha reserva, cantidad, monto total, estado
    - Controles de paginación: "Anterior", "Siguiente", "Página X de Y"
    - Ocultar paginación si totalElements <= 20
    - Mostrar mensaje vacío "No se encontraron reservas con los filtros seleccionados"
    - Mostrar error "Error al cargar las reservas. Intenta de nuevo más tarde"
    - Agregar `<h1>Gestión de Reservas</h1>` como encabezado
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9, 8.10, 10.7_

- [x] 9. Configurar rutas del módulo
  - [x] 9.1 Actualizar `reservations.routes.ts` y `admin.routes.ts` con las nuevas rutas
    - Agregar ruta `{ path: 'new', component: ReservationFormComponent }` en `reservations.routes.ts`
    - Agregar ruta para `AdminReservationsComponent` en `admin.routes.ts` protegida por `adminGuard`
    - Verificar que `/reservations` está protegida por `authGuard` en `app.routes.ts`
    - Verificar lazy loading de las rutas
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 8.8_

- [x] 10. Final checkpoint - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- El proyecto usa Vitest como test runner y fast-check para property-based testing
- Todos los componentes son standalone siguiendo el patrón existente del proyecto
- Los diálogos de confirmación son inline (no modales externos), siguiendo el patrón de `ExperiencesComponent`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "2.6", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "7.1", "8.1"] },
    { "id": 5, "tasks": ["5.4", "5.5", "7.2", "9.1"] }
  ]
}
```
