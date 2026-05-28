# Requirements Document

## Introduction

Este documento define los requisitos para el **Módulo de Experiencias Turísticas** del frontend Angular de Smart Tourism. El módulo permite a cualquier visitante explorar el catálogo de experiencias disponibles en Santander, ver el detalle de cada una y, si el usuario tiene rol ADMIN, gestionar el catálogo completo (crear, editar y desactivar experiencias).

El scaffolding base ya está implementado: existe un componente placeholder `ExperiencesComponent`, el archivo `experiences.routes.ts` y el design system con variables CSS. El backend expone los endpoints REST en `/api/v1/experiences`.

**Backend disponible:**
- `GET /api/v1/experiences` — listado paginado con filtros opcionales (`category`, `location`, `difficulty`, `minPrice`, `maxPrice`, `available`; paginación por defecto: page 0, size 20)
- `GET /api/v1/experiences/{id}` — detalle de una experiencia (incluye `schedules` y estadísticas de reseñas)
- `POST /api/v1/experiences` — crear experiencia (solo ADMIN)
- `PUT /api/v1/experiences/{id}` — actualizar experiencia (solo ADMIN)
- `DELETE /api/v1/experiences/{id}` — desactivar experiencia, borrado lógico (solo ADMIN)

---

## Glossary

- **Experiences_List**: Componente Angular que muestra el catálogo paginado de experiencias con filtros.
- **Experience_Card**: Componente Angular reutilizable que representa una experiencia en formato tarjeta.
- **Experience_Detail**: Componente Angular que muestra el detalle completo de una experiencia, incluyendo horarios y estadísticas de reseñas.
- **Experience_Form**: Formulario reactivo de Angular para crear o editar una experiencia (solo ADMIN).
- **Experiences_Service**: Servicio Angular que centraliza todas las peticiones HTTP al endpoint `/api/v1/experiences`.
- **Filter_Panel**: Sección del Experiences_List que contiene los controles de filtrado y búsqueda.
- **Pagination_Controls**: Controles de navegación entre páginas del listado.
- **Backend_API**: API REST del backend Spring Boot en `http://localhost:8080/api`.
- **Design_System**: Sistema de diseño establecido con variables CSS (`--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-error`, `--color-accent`, `--radius-card`, `--radius-control`).
- **Auth_Service**: Servicio Angular existente con `isAuthenticated()` y `getUserRole()` (roles: `'TOURIST'`, `'ADMIN'`).
- **Admin_Guard**: Guard Angular existente que protege rutas que requieren rol ADMIN.
- **Router**: Servicio de enrutamiento de Angular para navegación programática.
- **Difficulty**: Enumeración de niveles de dificultad: `EASY`, `MODERATE`, `HARD`, `EXTREME`.
- **ExperienceResponse**: DTO del backend con campos: `id`, `title`, `description`, `category`, `location`, `duration`, `difficulty`, `price`, `images`, `active`, `createdAt`, `updatedAt`, `averageRating`, `reviewCount`, `schedules`.
- **ScheduleResponse**: DTO del backend con campos: `id`, `dayOfWeek`, `startTime`, `endTime`, `availableSlots`.
- **Page**: Objeto de paginación del backend con campos: `content`, `totalElements`, `totalPages`, `number`, `size`.

---

## Requirements

### Requirement 1: Servicio de Experiencias HTTP

**User Story:** Como desarrollador, quiero un servicio Angular centralizado que gestione todas las peticiones HTTP al endpoint de experiencias, para que la lógica de comunicación con el backend esté encapsulada y sea reutilizable en todos los componentes del módulo.

#### Acceptance Criteria

1. THE Experiences_Service SHALL exponer un método `getExperiences(filters, page, size): Observable<Page<ExperienceResponse>>` que realice una petición GET a `/api/v1/experiences` con los parámetros de filtro y paginación como query params.
2. THE Experiences_Service SHALL exponer un método `getExperienceById(id: string): Observable<ExperienceResponse>` que realice una petición GET a `/api/v1/experiences/{id}`.
3. THE Experiences_Service SHALL exponer un método `createExperience(request: ExperienceRequest): Observable<ExperienceResponse>` que realice una petición POST a `/api/v1/experiences`.
4. THE Experiences_Service SHALL exponer un método `updateExperience(id: string, request: ExperienceRequest): Observable<ExperienceResponse>` que realice una petición PUT a `/api/v1/experiences/{id}`.
5. THE Experiences_Service SHALL exponer un método `deleteExperience(id: string): Observable<void>` que realice una petición DELETE a `/api/v1/experiences/{id}`.
6. WHEN el Backend_API responde con error HTTP, THE Experiences_Service SHALL propagar el error para que el componente consumidor lo maneje.
7. WHEN el método `getExperiences` es invocado con filtros nulos o indefinidos, THE Experiences_Service SHALL omitir esos parámetros de la query string.

---

### Requirement 2: Listado de Experiencias con Filtros

**User Story:** Como turista, quiero ver un listado de experiencias disponibles con la posibilidad de filtrar por categoría, ubicación, dificultad y precio, para que pueda encontrar rápidamente las experiencias que se ajustan a mis intereses.

#### Acceptance Criteria

1. WHEN el usuario navega a `/experiences`, THE Experiences_List SHALL realizar una petición GET a `/api/v1/experiences` con los parámetros de paginación por defecto (page 0, size 20) y mostrar los resultados.
2. THE Experiences_List SHALL mostrar cada experiencia usando el componente Experience_Card.
3. THE Filter_Panel SHALL contener un campo de texto para filtrar por ubicación (búsqueda parcial, insensible a mayúsculas).
4. THE Filter_Panel SHALL contener un selector (`<select>`) para filtrar por categoría con la opción "Todas las categorías" como valor por defecto.
5. THE Filter_Panel SHALL contener un selector (`<select>`) para filtrar por dificultad con las opciones: "Cualquier dificultad", "Fácil", "Moderada", "Difícil", "Extrema".
6. THE Filter_Panel SHALL contener dos campos numéricos para filtrar por precio mínimo y precio máximo.
7. WHEN el usuario modifica cualquier filtro del Filter_Panel, THE Experiences_List SHALL realizar una nueva petición GET a `/api/v1/experiences` con los filtros activos y resetear la paginación a la página 0.
8. WHEN el Backend_API responde con una lista vacía, THE Experiences_List SHALL mostrar el mensaje "No se encontraron experiencias con los filtros seleccionados".
9. WHEN el Backend_API responde con error, THE Experiences_List SHALL mostrar un mensaje de error "Error al cargar las experiencias. Intenta de nuevo más tarde".
10. WHILE la petición al Backend_API está en curso, THE Experiences_List SHALL mostrar un indicador de carga en lugar de las tarjetas.
11. THE Filter_Panel SHALL contener un botón "Limpiar filtros" que restablezca todos los filtros a sus valores por defecto y recargue el listado.

---

### Requirement 3: Paginación del Listado

**User Story:** Como turista, quiero poder navegar entre páginas del catálogo de experiencias, para que pueda explorar todas las experiencias disponibles sin que la página se vuelva lenta.

#### Acceptance Criteria

1. THE Pagination_Controls SHALL mostrar el número de página actual y el total de páginas.
2. THE Pagination_Controls SHALL mostrar un botón "Anterior" que esté deshabilitado cuando el usuario está en la primera página.
3. THE Pagination_Controls SHALL mostrar un botón "Siguiente" que esté deshabilitado cuando el usuario está en la última página.
4. WHEN el usuario hace clic en "Siguiente", THE Experiences_List SHALL realizar una petición GET a `/api/v1/experiences` con `page` incrementado en 1 y los filtros activos.
5. WHEN el usuario hace clic en "Anterior", THE Experiences_List SHALL realizar una petición GET a `/api/v1/experiences` con `page` decrementado en 1 y los filtros activos.
6. WHEN el total de experiencias es menor o igual a 20 (una sola página), THE Pagination_Controls SHALL estar ocultos.
7. THE Experiences_List SHALL mostrar el texto "Mostrando X–Y de Z experiencias" donde X, Y y Z son valores calculados a partir de la respuesta del Backend_API.

---

### Requirement 4: Componente de Tarjeta de Experiencia

**User Story:** Como turista, quiero ver una tarjeta visual con la información esencial de cada experiencia, para que pueda evaluar rápidamente si una experiencia me interesa antes de ver su detalle.

#### Acceptance Criteria

1. THE Experience_Card SHALL mostrar el título de la experiencia.
2. THE Experience_Card SHALL mostrar la categoría de la experiencia.
3. THE Experience_Card SHALL mostrar la ubicación de la experiencia.
4. THE Experience_Card SHALL mostrar la dificultad de la experiencia con una etiqueta visual de color diferenciado por nivel (`EASY`: verde, `MODERATE`: amarillo, `HARD`: naranja, `EXTREME`: rojo).
5. THE Experience_Card SHALL mostrar el precio de la experiencia formateado en pesos colombianos (COP).
6. THE Experience_Card SHALL mostrar la calificación promedio (`averageRating`) redondeada a un decimal, o el texto "Sin reseñas" si `averageRating` es nulo.
7. THE Experience_Card SHALL mostrar la primera imagen de la experiencia si existe, o un placeholder visual si la lista de imágenes está vacía.
8. WHEN el usuario hace clic en la Experience_Card, THE Router SHALL navegar a `/experiences/{id}`.
9. THE Experience_Card SHALL usar las variables CSS del Design_System para colores, bordes y radio de tarjeta.
10. THE Experience_Card SHALL ser un componente standalone que reciba la experiencia como `@Input()`.

---

### Requirement 5: Vista de Detalle de Experiencia

**User Story:** Como turista, quiero ver el detalle completo de una experiencia, incluyendo su descripción, horarios disponibles y estadísticas de reseñas, para que pueda tomar una decisión informada antes de reservar.

#### Acceptance Criteria

1. WHEN el usuario navega a `/experiences/{id}`, THE Experience_Detail SHALL realizar una petición GET a `/api/v1/experiences/{id}` y mostrar los datos de la experiencia.
2. THE Experience_Detail SHALL mostrar: título, descripción completa, categoría, ubicación, duración (en minutos), dificultad, precio formateado en COP.
3. THE Experience_Detail SHALL mostrar la galería de imágenes de la experiencia; si no hay imágenes, SHALL mostrar un placeholder visual.
4. THE Experience_Detail SHALL mostrar la sección de horarios con los campos: día de la semana, hora de inicio, hora de fin y plazas disponibles para cada `ScheduleResponse`.
5. IF la lista de horarios está vacía, THEN THE Experience_Detail SHALL mostrar el texto "No hay horarios disponibles actualmente".
6. THE Experience_Detail SHALL mostrar la calificación promedio y el número total de reseñas; si no hay reseñas, SHALL mostrar "Sin reseñas aún".
7. WHILE la petición al Backend_API está en curso, THE Experience_Detail SHALL mostrar un indicador de carga.
8. IF el Backend_API responde con código 404, THEN THE Experience_Detail SHALL mostrar el mensaje "Experiencia no encontrada" y un enlace para volver al listado.
9. IF el Backend_API responde con error distinto de 404, THEN THE Experience_Detail SHALL mostrar el mensaje "Error al cargar la experiencia. Intenta de nuevo más tarde".
10. THE Experience_Detail SHALL mostrar un botón "Volver al listado" que navegue a `/experiences`.

---

### Requirement 6: Integración con el Design System

**User Story:** Como desarrollador, quiero que todos los componentes del módulo de experiencias usen el design system establecido, para que la experiencia visual sea coherente con el resto de la aplicación.

#### Acceptance Criteria

1. THE Experiences_List SHALL usar `var(--color-bg)` como color de fondo de la página.
2. THE Experience_Card SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el estilo de la tarjeta.
3. THE Experience_Detail SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el contenedor principal.
4. THE Experience_Form SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el contenedor del formulario.
5. WHEN un campo del Experience_Form tiene un error de validación, THE Experience_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.
6. THE Experiences_List SHALL renderizar el botón de acción principal con `background: var(--color-primary)` y `border-radius: var(--radius-control)`.
7. THE Experience_Card SHALL mostrar la etiqueta de dificultad usando `var(--color-accent)` para `MODERATE`, `var(--color-error)` para `HARD` y `EXTREME`, y `var(--color-success)` para `EASY`.

---

### Requirement 7: Accesibilidad del Módulo

**User Story:** Como usuario con tecnologías de asistencia, quiero que el módulo de experiencias sea accesible, para que pueda navegar y explorar el catálogo usando lectores de pantalla o teclado.

#### Acceptance Criteria

1. THE Experiences_List SHALL tener un elemento `<h1>` con el texto "Experiencias Turísticas" como encabezado principal de la página.
2. THE Experience_Card SHALL tener el atributo `role="article"` en su elemento raíz.
3. THE Experience_Card SHALL tener un atributo `aria-label` que incluya el título de la experiencia (e.g., `aria-label="Ver detalle de {título}"`).
4. THE Experience_Detail SHALL tener un elemento `<h1>` con el título de la experiencia como encabezado principal.
5. WHEN el indicador de carga está visible, THE Experiences_List SHALL incluir el atributo `aria-busy="true"` en el contenedor principal.
6. WHEN el indicador de carga está visible, THE Experience_Detail SHALL incluir el atributo `aria-busy="true"` en el contenedor principal.
7. THE Filter_Panel SHALL tener etiquetas `<label>` asociadas a cada control de filtro mediante el atributo `for`.
8. THE Pagination_Controls SHALL tener atributos `aria-label` descriptivos en los botones "Anterior" y "Siguiente".
9. THE Experience_Form SHALL tener etiquetas `<label>` asociadas a cada campo de entrada mediante el atributo `for`.
10. WHEN el botón de envío del Experience_Form está deshabilitado, THE Experience_Form SHALL incluir el atributo `aria-disabled="true"`.

---

### Requirement 8: Gestión CRUD para Administradores

**User Story:** Como administrador, quiero poder crear, editar y desactivar experiencias desde el frontend, para que pueda gestionar el catálogo de la plataforma sin necesidad de acceder directamente al backend.

#### Acceptance Criteria

1. WHEN el usuario autenticado tiene rol `ADMIN` y navega a `/experiences`, THE Experiences_List SHALL mostrar un botón "Nueva experiencia" que navegue a `/experiences/new`.
2. WHEN el usuario autenticado tiene rol `ADMIN` y visualiza una Experience_Card, THE Experience_Card SHALL mostrar botones de acción "Editar" y "Desactivar".
3. WHEN el usuario ADMIN hace clic en "Editar" en una Experience_Card, THE Router SHALL navegar a `/experiences/{id}/edit`.
4. WHEN el usuario navega a `/experiences/new`, THE Experience_Form SHALL renderizarse vacío para crear una nueva experiencia.
5. WHEN el usuario navega a `/experiences/{id}/edit`, THE Experience_Form SHALL realizar una petición GET a `/api/v1/experiences/{id}` y pre-rellenar los campos con los datos existentes.
6. THE Experience_Form SHALL contener campos para: título (texto, requerido), descripción (textarea, requerido), categoría (texto, requerido), ubicación (texto, requerido), duración en minutos (número, requerido, positivo), dificultad (selector, requerido), precio en COP (número, requerido, positivo).
7. WHEN el usuario envía el Experience_Form en modo creación con datos válidos, THE Experience_Form SHALL realizar una petición POST a `/api/v1/experiences` y, tras respuesta exitosa, navegar a `/experiences`.
8. WHEN el usuario envía el Experience_Form en modo edición con datos válidos, THE Experience_Form SHALL realizar una petición PUT a `/api/v1/experiences/{id}` y, tras respuesta exitosa, navegar a `/experiences/{id}`.
9. WHEN el usuario ADMIN hace clic en "Desactivar" en una Experience_Card, THE Experiences_List SHALL mostrar un diálogo de confirmación con el texto "¿Desactivar esta experiencia? Esta acción no se puede deshacer fácilmente.".
10. WHEN el usuario confirma la desactivación, THE Experiences_List SHALL realizar una petición DELETE a `/api/v1/experiences/{id}` y, tras respuesta exitosa, eliminar la tarjeta del listado sin recargar la página.
11. IF el Backend_API responde con error al enviar el Experience_Form, THEN THE Experience_Form SHALL mostrar un mensaje de error descriptivo y mantener los datos del formulario.
12. WHILE el Experience_Form está enviando la petición al Backend_API, THE Experience_Form SHALL mostrar un indicador de carga y deshabilitar el botón de envío.
13. THE ruta `/experiences/new` SHALL estar protegida por el Admin_Guard.
14. THE ruta `/experiences/{id}/edit` SHALL estar protegida por el Admin_Guard.

---

### Requirement 9: Tests Unitarios del Experiences_Service

**User Story:** Como desarrollador, quiero tests unitarios para el Experiences_Service, para que pueda verificar que las peticiones HTTP se construyen correctamente con los parámetros esperados.

#### Acceptance Criteria

1. THE Experiences_Service SHALL tener un test que verifique que `getExperiences()` sin filtros realiza una petición GET a `/api/v1/experiences` con los parámetros de paginación por defecto.
2. THE Experiences_Service SHALL tener un test que verifique que `getExperiences()` con filtros activos incluye solo los parámetros no nulos en la query string.
3. THE Experiences_Service SHALL tener un test que verifique que `getExperienceById(id)` realiza una petición GET a `/api/v1/experiences/{id}`.
4. THE Experiences_Service SHALL tener un test que verifique que `createExperience(request)` realiza una petición POST a `/api/v1/experiences` con el cuerpo correcto.
5. THE Experiences_Service SHALL tener un test que verifique que `updateExperience(id, request)` realiza una petición PUT a `/api/v1/experiences/{id}` con el cuerpo correcto.
6. THE Experiences_Service SHALL tener un test que verifique que `deleteExperience(id)` realiza una petición DELETE a `/api/v1/experiences/{id}`.
7. THE Experiences_Service SHALL tener un test de propiedad que verifique que para cualquier conjunto de filtros con valores no nulos, todos esos filtros aparecen como query params en la URL de la petición (propiedad de completitud de filtros).

---

### Requirement 10: Tests Unitarios de Experiences_List

**User Story:** Como desarrollador, quiero tests unitarios para el componente Experiences_List, para que pueda verificar que el listado, los filtros y la paginación funcionan correctamente.

#### Acceptance Criteria

1. THE Experiences_List SHALL tener un test que verifique que al inicializar el componente se realiza una petición al backend con los parámetros por defecto.
2. THE Experiences_List SHALL tener un test que verifique que al cambiar un filtro se resetea la paginación a la página 0.
3. THE Experiences_List SHALL tener un test que verifique que el botón "Siguiente" está deshabilitado cuando se está en la última página.
4. THE Experiences_List SHALL tener un test que verifique que el botón "Anterior" está deshabilitado cuando se está en la primera página.
5. THE Experiences_List SHALL tener un test que verifique que se muestra el mensaje de lista vacía cuando el backend retorna `content: []`.
6. THE Experiences_List SHALL tener un test que verifique que se muestra el mensaje de error cuando el backend retorna un error HTTP.
7. THE Experiences_List SHALL tener un test de propiedad que verifique que para cualquier número de página `n` (0 ≤ n < totalPages), al navegar a esa página el componente realiza la petición con `page=n` (propiedad de consistencia de paginación).

---

### Requirement 11: Tests Unitarios de Experience_Card

**User Story:** Como desarrollador, quiero tests unitarios para el componente Experience_Card, para que pueda verificar que los datos se muestran correctamente y la navegación funciona.

#### Acceptance Criteria

1. THE Experience_Card SHALL tener un test que verifique que el título, categoría, ubicación y precio se renderizan correctamente dado un input de experiencia.
2. THE Experience_Card SHALL tener un test que verifique que se muestra "Sin reseñas" cuando `averageRating` es nulo.
3. THE Experience_Card SHALL tener un test que verifique que se muestra el placeholder cuando la lista de imágenes está vacía.
4. THE Experience_Card SHALL tener un test que verifique que al hacer clic en la tarjeta se navega a `/experiences/{id}`.
5. THE Experience_Card SHALL tener un test de propiedad que verifique que para cualquier valor de `averageRating` entre 0 y 5, el valor mostrado es el número redondeado a un decimal (propiedad de formato de calificación).

---

### Requirement 12: Tests Unitarios de Experience_Detail

**User Story:** Como desarrollador, quiero tests unitarios para el componente Experience_Detail, para que pueda verificar que el detalle se carga correctamente y los estados de error se manejan bien.

#### Acceptance Criteria

1. THE Experience_Detail SHALL tener un test que verifique que al inicializar el componente se realiza una petición GET al backend con el ID de la ruta.
2. THE Experience_Detail SHALL tener un test que verifique que se muestran todos los campos de la experiencia cuando el backend responde exitosamente.
3. THE Experience_Detail SHALL tener un test que verifique que se muestra el mensaje de "Experiencia no encontrada" cuando el backend responde con 404.
4. THE Experience_Detail SHALL tener un test que verifique que se muestra el mensaje de error genérico cuando el backend responde con un error distinto de 404.
5. THE Experience_Detail SHALL tener un test que verifique que se muestra "No hay horarios disponibles actualmente" cuando la lista de schedules está vacía.
6. THE Experience_Detail SHALL tener un test de propiedad que verifique que para cualquier lista de schedules no vacía, todos los schedules se renderizan en el DOM (propiedad de completitud de renderizado de horarios).
