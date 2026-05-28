# Requirements Document

## Introduction

Este documento define los requisitos para el **Módulo de Reservas** del frontend Angular de Smart Tourism. El módulo permite a los turistas autenticados crear reservas para experiencias turísticas, ver el historial de sus reservas, simular el pago de reservas pendientes y cancelar reservas. Los administradores pueden ver todas las reservas del sistema con filtros avanzados.

El scaffolding base ya está implementado: existe un componente placeholder `ReservationsComponent`, el archivo `reservations.routes.ts` y la ruta `/reservations` protegida por `authGuard` en `app.routes.ts`. El backend expone los endpoints REST correspondientes.

**Backend disponible (Turista):**
- `POST /api/v1/reservations` — crear reserva (requiere `experienceId`, `scheduleId`, `reservationDate`, `quantity`; retorna reserva con estado `PENDING_PAYMENT`, `totalAmount` y `expirationDate`)
- `GET /api/v1/reservations/me` — obtener mis reservas (retorna array de reservas ordenadas por fecha de creación descendente)
- `PATCH /api/v1/reservations/{id}/cancel` — cancelar una reserva propia (retorna 204 No Content)

**Backend disponible (Pagos):**
- `POST /api/v1/payments/simulate` — simular pago de una reserva (requiere `reservationId`; retorna `paymentStatus`: `APPROVED` o `REJECTED`, `transactionReference`, y datos actualizados de la reserva)

**Backend disponible (Admin):**
- `GET /api/v1/admin/reservations` — listar todas las reservas con filtros opcionales (`status`, `experienceId`, `startDate`, `endDate`; paginación por defecto: page 0, size 20, ordenado por `createdAt` descendente)

---

## Glossary

- **Reservations_List**: Componente Angular que muestra el historial de reservas del turista autenticado.
- **Reservation_Card**: Componente Angular reutilizable que representa una reserva en formato tarjeta con información resumida y acciones disponibles.
- **Reservation_Form**: Componente Angular con formulario reactivo para crear una nueva reserva seleccionando horario, fecha y cantidad de cupos.
- **Reservations_Service**: Servicio Angular que centraliza todas las peticiones HTTP a los endpoints de reservas (`/api/v1/reservations`).
- **Payments_Service**: Servicio Angular que centraliza las peticiones HTTP al endpoint de pagos (`/api/v1/payments`).
- **Admin_Reservations_List**: Componente Angular que muestra todas las reservas del sistema con filtros avanzados (solo ADMIN).
- **Backend_API**: API REST del backend Spring Boot en `http://localhost:8080/api`.
- **Design_System**: Sistema de diseño establecido con variables CSS (`--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-error`, `--color-accent`, `--color-success`, `--radius-card`, `--radius-control`).
- **Auth_Service**: Servicio Angular existente con `isAuthenticated()` y `getUserRole()` (roles: `'TOURIST'`, `'ADMIN'`).
- **Admin_Guard**: Guard Angular existente que protege rutas que requieren rol ADMIN.
- **Router**: Servicio de enrutamiento de Angular para navegación programática.
- **ReservationStatus**: Enumeración de estados de reserva: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `NO_SHOW`.
- **PaymentStatus**: Enumeración de estados de pago: `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`.
- **ReservationResponse**: DTO del backend con campos: `id`, `touristId`, `touristName`, `touristEmail`, `experienceId`, `experienceTitle`, `experienceLocation`, `scheduleId`, `reservationDate`, `quantity`, `totalAmount`, `status`, `expirationDate`, `createdAt`, `updatedAt`.
- **ReservationRequest**: DTO para crear reserva con campos: `experienceId`, `scheduleId`, `reservationDate`, `quantity`.
- **PaymentResponse**: DTO del backend con campos: `id`, `paymentStatus`, `transactionReference`, `amount`, `reservationId`, `reservationStatus`, `touristId`, `touristName`, `touristEmail`, `experienceId`, `experienceTitle`, `experienceLocation`, `reservationDate`, `quantity`, `totalAmount`, `expirationDate`, `createdAt`.
- **Page**: Objeto de paginación del backend con campos: `content`, `totalElements`, `totalPages`, `number`, `size`.

---

## Requirements

### Requirement 1: Servicio de Reservas HTTP

**User Story:** Como desarrollador, quiero un servicio Angular centralizado que gestione todas las peticiones HTTP a los endpoints de reservas, para que la lógica de comunicación con el backend esté encapsulada y sea reutilizable en todos los componentes del módulo.

#### Acceptance Criteria

1. THE Reservations_Service SHALL exponer un método `createReservation(request: ReservationRequest): Observable<ReservationResponse>` que realice una petición POST a `/api/v1/reservations` con el cuerpo de la solicitud.
2. THE Reservations_Service SHALL exponer un método `getMyReservations(): Observable<ReservationResponse[]>` que realice una petición GET a `/api/v1/reservations/me`.
3. THE Reservations_Service SHALL exponer un método `cancelReservation(id: string): Observable<void>` que realice una petición PATCH a `/api/v1/reservations/{id}/cancel`.
4. WHEN el Backend_API responde con error HTTP, THE Reservations_Service SHALL propagar el error para que el componente consumidor lo maneje.

---

### Requirement 2: Servicio de Pagos HTTP

**User Story:** Como desarrollador, quiero un servicio Angular que gestione las peticiones HTTP al endpoint de simulación de pagos, para que la lógica de pago esté encapsulada y sea reutilizable.

#### Acceptance Criteria

1. THE Payments_Service SHALL exponer un método `simulatePayment(reservationId: string): Observable<PaymentResponse>` que realice una petición POST a `/api/v1/payments/simulate` con el cuerpo `{ reservationId }`.
2. WHEN el Backend_API responde con error HTTP, THE Payments_Service SHALL propagar el error para que el componente consumidor lo maneje.

---

### Requirement 3: Listado de Reservas del Turista

**User Story:** Como turista, quiero ver el historial de mis reservas con su estado actual, para que pueda hacer seguimiento de mis experiencias reservadas y tomar acciones como pagar o cancelar.

#### Acceptance Criteria

1. WHEN el usuario navega a `/reservations`, THE Reservations_List SHALL realizar una petición GET a `/api/v1/reservations/me` y mostrar los resultados.
2. THE Reservations_List SHALL mostrar cada reserva usando el componente Reservation_Card.
3. WHEN el Backend_API responde con una lista vacía, THE Reservations_List SHALL mostrar el mensaje "No tienes reservas aún. ¡Explora las experiencias disponibles!" con un enlace a `/experiences`.
4. WHEN el Backend_API responde con error, THE Reservations_List SHALL mostrar un mensaje de error "Error al cargar tus reservas. Intenta de nuevo más tarde".
5. WHILE la petición al Backend_API está en curso, THE Reservations_List SHALL mostrar un indicador de carga en lugar de las tarjetas.

---

### Requirement 4: Componente de Tarjeta de Reserva

**User Story:** Como turista, quiero ver una tarjeta visual con la información esencial de cada reserva, para que pueda identificar rápidamente el estado y los detalles de mis reservas.

#### Acceptance Criteria

1. THE Reservation_Card SHALL mostrar el título de la experiencia reservada (`experienceTitle`).
2. THE Reservation_Card SHALL mostrar la ubicación de la experiencia (`experienceLocation`).
3. THE Reservation_Card SHALL mostrar la fecha de la reserva (`reservationDate`) formateada en formato legible (dd/MM/yyyy).
4. THE Reservation_Card SHALL mostrar la cantidad de cupos reservados (`quantity`).
5. THE Reservation_Card SHALL mostrar el monto total (`totalAmount`) formateado en pesos colombianos (COP).
6. THE Reservation_Card SHALL mostrar el estado de la reserva (`status`) con una etiqueta visual de color diferenciado: `PENDING_PAYMENT` en amarillo, `CONFIRMED` en verde, `CANCELLED` en gris, `EXPIRED` en rojo, `NO_SHOW` en rojo.
7. WHEN el estado de la reserva es `PENDING_PAYMENT`, THE Reservation_Card SHALL mostrar un botón "Pagar" que inicie el flujo de simulación de pago.
8. WHEN el estado de la reserva es `PENDING_PAYMENT`, THE Reservation_Card SHALL mostrar la fecha de expiración (`expirationDate`) con el texto "Expira: {fecha y hora}".
9. WHEN el estado de la reserva es `PENDING_PAYMENT` o `CONFIRMED`, THE Reservation_Card SHALL mostrar un botón "Cancelar" que inicie el flujo de cancelación.
10. THE Reservation_Card SHALL ser un componente standalone que reciba la reserva como `@Input()`.
11. THE Reservation_Card SHALL usar las variables CSS del Design_System para colores, bordes y radio de tarjeta.

---

### Requirement 5: Creación de Reserva

**User Story:** Como turista, quiero poder crear una reserva para una experiencia seleccionando un horario, fecha y cantidad de cupos, para que pueda asegurar mi lugar en la experiencia.

#### Acceptance Criteria

1. WHEN el usuario navega a `/reservations/new` con los query params `experienceId` y `scheduleId`, THE Reservation_Form SHALL pre-seleccionar la experiencia y el horario correspondientes.
2. THE Reservation_Form SHALL contener un campo de fecha (`reservationDate`) que solo permita seleccionar fechas futuras.
3. THE Reservation_Form SHALL contener un campo numérico de cantidad (`quantity`) con valor mínimo de 1.
4. WHEN el usuario envía el Reservation_Form con datos válidos, THE Reservation_Form SHALL realizar una petición POST a `/api/v1/reservations` y, tras respuesta exitosa, navegar a `/reservations`.
5. IF el Backend_API responde con error al enviar el Reservation_Form, THEN THE Reservation_Form SHALL mostrar un mensaje de error descriptivo y mantener los datos del formulario.
6. WHILE el Reservation_Form está enviando la petición al Backend_API, THE Reservation_Form SHALL mostrar un indicador de carga y deshabilitar el botón de envío.
7. THE Reservation_Form SHALL mostrar un resumen con el nombre de la experiencia, el horario seleccionado y el precio unitario antes de confirmar.

---

### Requirement 6: Simulación de Pago

**User Story:** Como turista, quiero poder simular el pago de una reserva pendiente, para que mi reserva quede confirmada y pueda asistir a la experiencia.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Pagar" en una Reservation_Card, THE Reservations_List SHALL mostrar un diálogo de confirmación con el texto "¿Confirmar pago de {totalAmount} COP para {experienceTitle}?".
2. WHEN el usuario confirma el pago, THE Reservations_List SHALL realizar una petición POST a `/api/v1/payments/simulate` con el `reservationId`.
3. WHEN el Backend_API responde con `paymentStatus: 'APPROVED'`, THE Reservations_List SHALL mostrar un mensaje de éxito "Pago aprobado. Tu reserva está confirmada." y actualizar el estado de la reserva a `CONFIRMED` en la interfaz.
4. WHEN el Backend_API responde con `paymentStatus: 'REJECTED'`, THE Reservations_List SHALL mostrar un mensaje de advertencia "El pago fue rechazado. Puedes intentarlo de nuevo." y mantener el estado de la reserva como `PENDING_PAYMENT`.
5. IF el Backend_API responde con error HTTP al simular el pago, THEN THE Reservations_List SHALL mostrar un mensaje de error "Error al procesar el pago. Intenta de nuevo más tarde.".
6. WHILE la petición de pago está en curso, THE Reservation_Card SHALL deshabilitar el botón "Pagar" y mostrar un indicador de carga.

---

### Requirement 7: Cancelación de Reserva

**User Story:** Como turista, quiero poder cancelar una reserva pendiente o confirmada, para que pueda liberar mi lugar si ya no puedo asistir a la experiencia.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Cancelar" en una Reservation_Card, THE Reservations_List SHALL mostrar un diálogo de confirmación con el texto "¿Cancelar esta reserva? Esta acción no se puede deshacer.".
2. WHEN el usuario confirma la cancelación, THE Reservations_List SHALL realizar una petición PATCH a `/api/v1/reservations/{id}/cancel`.
3. WHEN el Backend_API responde exitosamente (204), THE Reservations_List SHALL actualizar el estado de la reserva a `CANCELLED` en la interfaz sin recargar la página.
4. IF el Backend_API responde con error al cancelar, THEN THE Reservations_List SHALL mostrar un mensaje de error "Error al cancelar la reserva. Intenta de nuevo más tarde.".
5. WHILE la petición de cancelación está en curso, THE Reservation_Card SHALL deshabilitar el botón "Cancelar" y mostrar un indicador de carga.

---

### Requirement 8: Listado de Reservas para Administradores

**User Story:** Como administrador, quiero ver todas las reservas del sistema con filtros por estado, experiencia y rango de fechas, para que pueda monitorear la actividad de reservas de la plataforma.

#### Acceptance Criteria

1. WHEN el usuario con rol ADMIN navega a `/admin/reservations`, THE Admin_Reservations_List SHALL realizar una petición GET a `/api/v1/admin/reservations` con los parámetros de paginación por defecto (page 0, size 20).
2. THE Admin_Reservations_List SHALL contener un selector para filtrar por estado de reserva con las opciones: "Todos los estados", "Pendiente de pago", "Confirmada", "Cancelada", "Expirada", "No asistió".
3. THE Admin_Reservations_List SHALL contener campos de fecha para filtrar por rango de fechas (fecha inicio y fecha fin).
4. WHEN el usuario modifica cualquier filtro, THE Admin_Reservations_List SHALL realizar una nueva petición GET con los filtros activos y resetear la paginación a la página 0.
5. THE Admin_Reservations_List SHALL mostrar cada reserva con: nombre del turista, email del turista, título de la experiencia, fecha de reserva, cantidad, monto total y estado.
6. THE Admin_Reservations_List SHALL incluir controles de paginación con botones "Anterior" y "Siguiente" y el texto "Página X de Y".
7. WHEN el total de reservas es menor o igual a 20 (una sola página), THE Admin_Reservations_List SHALL ocultar los controles de paginación.
8. THE ruta `/admin/reservations` SHALL estar protegida por el Admin_Guard.
9. WHEN el Backend_API responde con una lista vacía, THE Admin_Reservations_List SHALL mostrar el mensaje "No se encontraron reservas con los filtros seleccionados".
10. WHEN el Backend_API responde con error, THE Admin_Reservations_List SHALL mostrar un mensaje de error "Error al cargar las reservas. Intenta de nuevo más tarde".

---

### Requirement 9: Integración con el Design System

**User Story:** Como desarrollador, quiero que todos los componentes del módulo de reservas usen el design system establecido, para que la experiencia visual sea coherente con el resto de la aplicación.

#### Acceptance Criteria

1. THE Reservations_List SHALL usar `var(--color-bg)` como color de fondo de la página.
2. THE Reservation_Card SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el estilo de la tarjeta.
3. THE Reservation_Form SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el contenedor del formulario.
4. THE Reservation_Card SHALL mostrar la etiqueta de estado usando `var(--color-accent)` para `PENDING_PAYMENT`, `var(--color-success)` para `CONFIRMED`, `var(--color-muted)` para `CANCELLED`, y `var(--color-error)` para `EXPIRED` y `NO_SHOW`.
5. WHEN un campo del Reservation_Form tiene un error de validación, THE Reservation_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.
6. THE Reservations_List SHALL renderizar los botones de acción principal con `background: var(--color-primary)` y `border-radius: var(--radius-control)`.

---

### Requirement 10: Accesibilidad del Módulo

**User Story:** Como usuario con tecnologías de asistencia, quiero que el módulo de reservas sea accesible, para que pueda navegar y gestionar mis reservas usando lectores de pantalla o teclado.

#### Acceptance Criteria

1. THE Reservations_List SHALL tener un elemento `<h1>` con el texto "Mis Reservas" como encabezado principal de la página.
2. THE Reservation_Card SHALL tener el atributo `role="article"` en su elemento raíz.
3. THE Reservation_Card SHALL tener un atributo `aria-label` que incluya el título de la experiencia y el estado de la reserva (e.g., `aria-label="Reserva de {título} - {estado}"`).
4. WHEN el indicador de carga está visible, THE Reservations_List SHALL incluir el atributo `aria-busy="true"` en el contenedor principal.
5. THE Reservation_Form SHALL tener etiquetas `<label>` asociadas a cada campo de entrada mediante el atributo `for`.
6. WHEN el botón de envío del Reservation_Form está deshabilitado, THE Reservation_Form SHALL incluir el atributo `aria-disabled="true"`.
7. THE Admin_Reservations_List SHALL tener un elemento `<h1>` con el texto "Gestión de Reservas" como encabezado principal.
8. WHEN se muestra un diálogo de confirmación (pago o cancelación), THE Reservations_List SHALL incluir los atributos `role="dialog"` y `aria-modal="true"` en el contenedor del diálogo.

---

### Requirement 11: Configuración de Rutas

**User Story:** Como desarrollador, quiero que las rutas del módulo de reservas estén correctamente configuradas con lazy loading y guards, para que la navegación sea segura y eficiente.

#### Acceptance Criteria

1. THE Router SHALL cargar el módulo de reservas bajo la ruta `/reservations` con lazy loading.
2. THE ruta `/reservations` SHALL estar protegida por el Auth_Guard existente.
3. THE ruta `/reservations` (path vacío) SHALL renderizar el componente Reservations_List.
4. THE ruta `/reservations/new` SHALL renderizar el componente Reservation_Form.
5. THE ruta `/admin/reservations` SHALL renderizar el componente Admin_Reservations_List y estar protegida por el Admin_Guard.

---

### Requirement 12: Tests Unitarios del Reservations_Service

**User Story:** Como desarrollador, quiero tests unitarios para el Reservations_Service, para que pueda verificar que las peticiones HTTP se construyen correctamente.

#### Acceptance Criteria

1. THE Reservations_Service SHALL tener un test que verifique que `createReservation(request)` realiza una petición POST a `/api/v1/reservations` con el cuerpo correcto.
2. THE Reservations_Service SHALL tener un test que verifique que `getMyReservations()` realiza una petición GET a `/api/v1/reservations/me`.
3. THE Reservations_Service SHALL tener un test que verifique que `cancelReservation(id)` realiza una petición PATCH a `/api/v1/reservations/{id}/cancel`.
4. THE Reservations_Service SHALL tener un test de propiedad que verifique que para cualquier `ReservationRequest` con campos válidos, la petición POST contiene exactamente esos campos en el cuerpo (propiedad de completitud del request body).

---

### Requirement 13: Tests Unitarios del Payments_Service

**User Story:** Como desarrollador, quiero tests unitarios para el Payments_Service, para que pueda verificar que la petición de simulación de pago se construye correctamente.

#### Acceptance Criteria

1. THE Payments_Service SHALL tener un test que verifique que `simulatePayment(reservationId)` realiza una petición POST a `/api/v1/payments/simulate` con el cuerpo `{ reservationId }`.
2. THE Payments_Service SHALL tener un test que verifique que el error HTTP se propaga correctamente al consumidor.

---

### Requirement 14: Tests Unitarios de Reservations_List

**User Story:** Como desarrollador, quiero tests unitarios para el componente Reservations_List, para que pueda verificar que el listado, las acciones de pago y cancelación funcionan correctamente.

#### Acceptance Criteria

1. THE Reservations_List SHALL tener un test que verifique que al inicializar el componente se realiza una petición al backend.
2. THE Reservations_List SHALL tener un test que verifique que se muestra el mensaje de lista vacía cuando el backend retorna un array vacío.
3. THE Reservations_List SHALL tener un test que verifique que se muestra el mensaje de error cuando el backend retorna un error HTTP.
4. THE Reservations_List SHALL tener un test que verifique que al confirmar un pago se realiza la petición POST a `/api/v1/payments/simulate`.
5. THE Reservations_List SHALL tener un test que verifique que al confirmar una cancelación se realiza la petición PATCH a `/api/v1/reservations/{id}/cancel`.
6. THE Reservations_List SHALL tener un test de propiedad que verifique que para cualquier lista de reservas no vacía, todas las reservas se renderizan en el DOM (propiedad de completitud de renderizado).

---

### Requirement 15: Tests Unitarios de Reservation_Card

**User Story:** Como desarrollador, quiero tests unitarios para el componente Reservation_Card, para que pueda verificar que los datos se muestran correctamente y las acciones están disponibles según el estado.

#### Acceptance Criteria

1. THE Reservation_Card SHALL tener un test que verifique que el título de la experiencia, ubicación, fecha, cantidad y monto total se renderizan correctamente.
2. THE Reservation_Card SHALL tener un test que verifique que el botón "Pagar" solo se muestra cuando el estado es `PENDING_PAYMENT`.
3. THE Reservation_Card SHALL tener un test que verifique que el botón "Cancelar" se muestra cuando el estado es `PENDING_PAYMENT` o `CONFIRMED`.
4. THE Reservation_Card SHALL tener un test que verifique que no se muestran botones de acción cuando el estado es `CANCELLED`, `EXPIRED` o `NO_SHOW`.
5. THE Reservation_Card SHALL tener un test de propiedad que verifique que para cualquier valor de `totalAmount` positivo, el valor mostrado está formateado correctamente en COP (propiedad de formato de monto).
