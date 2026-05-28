# Requirements Document

## Introduction

Este documento define los requisitos para el **Módulo de Administración de Usuarios** del frontend Angular de Smart Tourism. El módulo permite a los administradores gestionar los usuarios del sistema: visualizar la lista completa de usuarios registrados con paginación, y activar o desactivar cuentas de usuario mediante un toggle de estado con confirmación.

El módulo se integra dentro de la estructura existente del panel de administración (`/admin`) y sigue los mismos patrones establecidos por el componente `AdminReservationsComponent` (standalone, OnPush, inyección con `inject`, paginación local).

**Backend disponible:**
- `GET /api/v1/admin/users` — Listar todos los usuarios paginados (rol: ADMIN)
  - Query params: `page` (default 0), `size` (default 20), `sort` (default createdAt,desc)
  - Respuesta: `Page<UserResponse>`
- `PATCH /api/v1/admin/users/{userId}/status` — Actualizar estado activo de un usuario (rol: ADMIN)
  - Body: `{ active: boolean }`
  - Respuesta: `UserResponse`
  - Error: 404 si el usuario no existe

---

## Glossary

- **Admin_Users_Service**: Servicio Angular que centraliza las peticiones HTTP al endpoint `/api/v1/admin/users` para listar usuarios y actualizar su estado.
- **Admin_Users_Component**: Componente Angular standalone que muestra la tabla de usuarios con paginación y permite activar/desactivar usuarios.
- **Admin_Dashboard_Component**: Componente Angular existente (`AdminComponent`) que se actualizará para funcionar como panel de navegación del módulo de administración con enlaces a las sub-secciones (usuarios y reservas).
- **Confirmation_Dialog**: Componente Angular existente (`ConfirmationDialogComponent`) reutilizable que muestra un diálogo modal de confirmación con título, mensaje, botón confirmar y botón cancelar.
- **Auth_Service**: Servicio Angular existente con métodos `isAuthenticated()`, `getUserRole()` y `getToken()`.
- **Backend_API**: API REST del backend Spring Boot en `http://localhost:8080/api/v1`.
- **Design_System**: Sistema de diseño con variables CSS (`--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-error`, `--color-accent`, `--color-success`, `--radius-card`, `--radius-control`).
- **UserResponse**: DTO del backend con campos: `id` (UUID), `fullName` (String), `email` (String), `phone` (String), `documentNumber` (String), `role` ("TOURIST" | "ADMIN"), `active` (Boolean), `createdAt` (LocalDateTime), `updatedAt` (LocalDateTime).
- **UpdateUserStatusRequest**: DTO para actualizar el estado de un usuario con campo: `active` (Boolean, requerido).
- **Page**: Objeto de respuesta paginada de Spring con campos: `content` (array), `totalElements` (number), `totalPages` (number), `number` (number, página actual), `size` (number).

---

## Requirements

### Requisito 1: Servicio HTTP de Administración de Usuarios

**User Story:** Como desarrollador, quiero un servicio Angular centralizado que gestione las peticiones HTTP al endpoint de administración de usuarios, para que la lógica de comunicación con el backend esté encapsulada y sea reutilizable.

#### Criterios de Aceptación

1. THE Admin_Users_Service SHALL exponer un método `getUsers(page: number, size: number): Observable<Page<UserResponse>>` que realice una petición GET a `/api/v1/admin/users` con los parámetros de paginación `page` y `size`.
2. THE Admin_Users_Service SHALL exponer un método `updateUserStatus(userId: string, active: boolean): Observable<UserResponse>` que realice una petición PATCH a `/api/v1/admin/users/{userId}/status` con el cuerpo `{ active }`.
3. WHEN el Backend_API responde con error HTTP, THE Admin_Users_Service SHALL propagar el error para que el componente consumidor lo maneje.
4. THE Admin_Users_Service SHALL usar `environment.apiUrl` como base URL para todas las peticiones HTTP.

---

### Requisito 2: Lista de Usuarios con Paginación

**User Story:** Como administrador, quiero ver una tabla con todos los usuarios registrados en el sistema con paginación, para que pueda revisar la información de los usuarios de forma organizada.

#### Criterios de Aceptación

1. WHEN el Admin_Users_Component se inicializa, THE Admin_Users_Component SHALL realizar una petición GET a `/api/v1/admin/users` con `page=0` y `size=20` y mostrar los usuarios obtenidos en una tabla.
2. THE Admin_Users_Component SHALL mostrar para cada usuario las siguientes columnas: nombre completo (`fullName`), email (`email`), teléfono (`phone`), rol (`role`), estado (activo/inactivo basado en `active`) y fecha de creación (`createdAt`) formateada.
3. WHILE la petición al Backend_API está en curso, THE Admin_Users_Component SHALL mostrar un indicador de carga con el texto "Cargando...".
4. WHEN la lista de usuarios está vacía, THE Admin_Users_Component SHALL mostrar el mensaje "No se encontraron usuarios registrados".
5. IF el Backend_API responde con error al obtener los usuarios, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Error al cargar los usuarios. Intenta de nuevo más tarde".
6. WHEN el total de elementos supera el tamaño de página (20), THE Admin_Users_Component SHALL mostrar controles de paginación con botones "Anterior" y "Siguiente" y el indicador de página actual.
7. WHEN el usuario hace clic en "Siguiente", THE Admin_Users_Component SHALL cargar la siguiente página de usuarios.
8. WHEN el usuario hace clic en "Anterior", THE Admin_Users_Component SHALL cargar la página anterior de usuarios.
9. WHILE la página actual es la primera (page=0), THE Admin_Users_Component SHALL deshabilitar el botón "Anterior".
10. WHILE la página actual es la última, THE Admin_Users_Component SHALL deshabilitar el botón "Siguiente".

---

### Requisito 3: Toggle de Estado de Usuario con Confirmación

**User Story:** Como administrador, quiero poder activar o desactivar usuarios con un diálogo de confirmación previo, para que pueda gestionar el acceso al sistema de forma segura evitando cambios accidentales.

#### Criterios de Aceptación

1. THE Admin_Users_Component SHALL mostrar un botón de acción en cada fila de la tabla que indique "Desactivar" para usuarios activos y "Activar" para usuarios inactivos.
2. WHEN el administrador hace clic en el botón de acción de un usuario, THE Admin_Users_Component SHALL mostrar el Confirmation_Dialog con un mensaje que indique la acción a realizar y el nombre del usuario afectado.
3. WHEN el administrador confirma la acción en el Confirmation_Dialog, THE Admin_Users_Component SHALL realizar una petición PATCH a `/api/v1/admin/users/{userId}/status` con el nuevo valor de `active` invertido.
4. WHEN el Backend_API responde exitosamente tras actualizar el estado, THE Admin_Users_Component SHALL actualizar el estado del usuario en la tabla sin recargar toda la lista y cerrar el Confirmation_Dialog.
5. IF el Backend_API responde con código 404 al actualizar el estado, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Usuario no encontrado" y cerrar el Confirmation_Dialog.
6. IF el Backend_API responde con un error distinto de 404, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Error al actualizar el estado del usuario. Intenta de nuevo más tarde" y cerrar el Confirmation_Dialog.
7. WHEN el administrador cancela la acción en el Confirmation_Dialog, THE Admin_Users_Component SHALL cerrar el diálogo sin realizar ninguna petición.
8. WHILE la petición de actualización de estado está en curso, THE Admin_Users_Component SHALL mostrar el Confirmation_Dialog en estado de procesamiento (`isProcessing=true`) para evitar múltiples envíos.

---

### Requisito 4: Panel de Administración (Dashboard)

**User Story:** Como administrador, quiero un panel de administración con navegación a las sub-secciones disponibles (usuarios y reservas), para que pueda acceder fácilmente a las diferentes funcionalidades de gestión.

#### Criterios de Aceptación

1. THE Admin_Dashboard_Component SHALL mostrar un encabezado con el texto "Panel de Administración".
2. THE Admin_Dashboard_Component SHALL mostrar enlaces de navegación a las secciones "Gestión de Usuarios" (ruta `/admin/users`) y "Gestión de Reservas" (ruta `/admin/reservations`).
3. THE Admin_Dashboard_Component SHALL usar el componente `RouterLink` de Angular para la navegación interna.
4. THE Admin_Dashboard_Component SHALL presentar los enlaces como tarjetas con un título descriptivo y una breve descripción de cada sección.

---

### Requisito 5: Configuración de Rutas

**User Story:** Como desarrollador, quiero que la ruta `/admin/users` esté configurada en el módulo de rutas del admin, para que el componente de gestión de usuarios sea accesible desde la navegación.

#### Criterios de Aceptación

1. THE admin.routes.ts SHALL incluir una ruta con path `users` que cargue el Admin_Users_Component.
2. THE admin.routes.ts SHALL mantener las rutas existentes para `''` (Admin_Dashboard_Component) y `reservations` (AdminReservationsComponent) sin modificaciones.

---

### Requisito 6: Accesibilidad del Módulo de Usuarios

**User Story:** Como usuario con tecnologías de asistencia, quiero que el módulo de administración de usuarios sea accesible, para que pueda interactuar con la tabla y los controles usando lectores de pantalla o navegación por teclado.

#### Criterios de Aceptación

1. THE Admin_Users_Component SHALL usar un elemento `<table>` semántico con `<thead>`, `<tbody>`, `<th>` y `<td>` para la lista de usuarios.
2. THE Admin_Users_Component SHALL incluir un atributo `aria-label` en la tabla con el texto "Lista de usuarios".
3. THE Admin_Users_Component SHALL incluir atributos `aria-label` en los botones de paginación ("Página anterior" y "Página siguiente").
4. THE Admin_Users_Component SHALL incluir un atributo `aria-label` descriptivo en cada botón de acción de estado (e.g., "Desactivar usuario Juan Pérez").
5. WHEN se muestra un mensaje de error, THE Admin_Users_Component SHALL usar el atributo `role="alert"` para que los lectores de pantalla lo anuncien.
6. THE Admin_Dashboard_Component SHALL usar elementos `<nav>` con `aria-label="Navegación de administración"` para los enlaces de navegación.
7. THE Admin_Users_Component SHALL mostrar el estado del usuario con un badge que incluya un `aria-label` descriptivo (e.g., "Estado: Activo" o "Estado: Inactivo").

---

### Requisito 7: Integración con el Design System

**User Story:** Como desarrollador, quiero que todos los componentes del módulo de usuarios usen el design system establecido, para que la experiencia visual sea coherente con el resto de la aplicación.

#### Criterios de Aceptación

1. THE Admin_Users_Component SHALL usar `var(--color-surface)` para el fondo de la tabla y `var(--radius-card)` para el contenedor.
2. THE Admin_Users_Component SHALL usar `var(--color-border)` para los bordes de las celdas de la tabla.
3. THE Admin_Users_Component SHALL mostrar el badge de estado activo con `var(--color-success)` y el badge de estado inactivo con `var(--color-error)`.
4. THE Admin_Users_Component SHALL renderizar los botones de paginación con `var(--color-primary)` y `border-radius: var(--radius-control)`.
5. THE Admin_Dashboard_Component SHALL usar `var(--color-surface)` y `var(--radius-card)` para las tarjetas de navegación.
6. THE Admin_Dashboard_Component SHALL usar `var(--color-primary)` para los títulos de las tarjetas de navegación.
7. WHEN un mensaje de error se muestra, THE Admin_Users_Component SHALL usar `var(--color-error)` para el color del texto.

---

### Requisito 8: Manejo de Errores

**User Story:** Como administrador, quiero recibir mensajes claros cuando ocurre un error al gestionar usuarios, para que pueda entender qué sucedió y qué acción tomar.

#### Criterios de Aceptación

1. IF el Backend_API responde con error de red o un código de error no esperado al listar usuarios, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Error al cargar los usuarios. Intenta de nuevo más tarde" y ocultar el indicador de carga.
2. IF el Backend_API responde con código 404 al actualizar el estado de un usuario, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Usuario no encontrado".
3. IF el Backend_API responde con un error distinto de 404 al actualizar el estado, THEN THE Admin_Users_Component SHALL mostrar el mensaje "Error al actualizar el estado del usuario. Intenta de nuevo más tarde".
4. WHEN se muestra un mensaje de error tras una acción de actualización de estado, THE Admin_Users_Component SHALL mantener la tabla de usuarios visible con los datos previamente cargados.

---

### Requisito 9: Tests Unitarios del Admin_Users_Service

**User Story:** Como desarrollador, quiero tests unitarios para el Admin_Users_Service, para que pueda verificar que las peticiones HTTP se construyen correctamente.

#### Criterios de Aceptación

1. THE Admin_Users_Service SHALL tener un test que verifique que `getUsers(page, size)` realiza una petición GET a `/api/v1/admin/users` con los parámetros `page` y `size` correctos.
2. THE Admin_Users_Service SHALL tener un test que verifique que `updateUserStatus(userId, active)` realiza una petición PATCH a `/api/v1/admin/users/{userId}/status` con el cuerpo `{ active }`.
3. THE Admin_Users_Service SHALL tener un test que verifique que los errores HTTP se propagan correctamente al suscriptor.
4. THE Admin_Users_Service SHALL tener un test de propiedad (PBT) que verifique que para cualquier combinación válida de `page` (entero >= 0) y `size` (entero > 0), la URL generada contiene los parámetros de paginación correctos (propiedad de construcción correcta de URL).

---

### Requisito 10: Tests Unitarios del Admin_Users_Component

**User Story:** Como desarrollador, quiero tests unitarios para el Admin_Users_Component, para que pueda verificar que la tabla, la paginación y el toggle de estado funcionan correctamente.

#### Criterios de Aceptación

1. THE Admin_Users_Component SHALL tener un test que verifique que se muestra el indicador de carga mientras la petición está en curso.
2. THE Admin_Users_Component SHALL tener un test que verifique que se muestra el mensaje de lista vacía cuando no hay usuarios.
3. THE Admin_Users_Component SHALL tener un test que verifique que se muestra el mensaje de error cuando el backend responde con error.
4. THE Admin_Users_Component SHALL tener un test de propiedad (PBT) que verifique que para cualquier lista de usuarios no vacía, todas las filas se renderizan en la tabla con nombre, email, teléfono, rol y estado (propiedad de completitud de renderizado).
5. THE Admin_Users_Component SHALL tener un test que verifique que al hacer clic en el botón de acción se muestra el Confirmation_Dialog con el mensaje correcto.
6. THE Admin_Users_Component SHALL tener un test que verifique que al confirmar la acción se actualiza el estado del usuario en la tabla.
7. THE Admin_Users_Component SHALL tener un test que verifique que los controles de paginación se muestran cuando el total de elementos supera 20.
8. THE Admin_Users_Component SHALL tener un test que verifique que el botón "Anterior" está deshabilitado en la primera página.
