# Documento de Requisitos — Módulo de Reseñas

## Introducción

Este documento define los requisitos para el **Módulo de Reseñas** del frontend Angular de Smart Tourism. El módulo permite a los turistas autenticados con reserva confirmada crear reseñas para experiencias, y a cualquier visitante visualizar las reseñas existentes con calificaciones en estrellas, comentarios y estadísticas.

Las reseñas se muestran dentro de la página de detalle de experiencia (`/experiences/:id`), no como una ruta independiente. El formulario de creación de reseña solo es visible para turistas autenticados.

**Backend disponible:**
- `POST /api/v1/reviews` — Crear una reseña (rol: TOURIST, requiere reserva confirmada para la experiencia)
  - Body: `{ experienceId: UUID, rating: Integer (1-5), comment: String (opcional) }`
  - Respuesta: `ReviewResponse`
  - Errores: 403 si no tiene reserva confirmada, 409 si ya existe reseña
- `GET /api/v1/reviews/experiences/{experienceId}/reviews` — Obtener reseñas de una experiencia (público, sin autenticación)
  - Respuesta: `List<ReviewResponse>`
  - Error: 404 si la experiencia no existe

---

## Glosario

- **Reviews_Service**: Servicio Angular que centraliza las peticiones HTTP al endpoint `/api/v1/reviews`.
- **Review_List**: Componente Angular que muestra la lista de reseñas de una experiencia con calificaciones en estrellas, comentarios, nombre del turista y fecha.
- **Review_Form**: Componente Angular con formulario para que un turista envíe una reseña (selector de estrellas 1-5 y comentario opcional).
- **Star_Rating**: Componente Angular reutilizable que muestra una calificación en estrellas de forma visual (usado tanto en el formulario como en la lista de reseñas).
- **Review_Statistics**: Sección que muestra el promedio de calificación y el número total de reseñas de una experiencia.
- **Experience_Detail**: Componente Angular existente en `/experiences/:id` donde se integran los componentes de reseñas.
- **Auth_Service**: Servicio Angular existente con métodos `isAuthenticated()`, `getUserRole()` y `getToken()`.
- **Backend_API**: API REST del backend Spring Boot en `http://localhost:8080/api`.
- **Design_System**: Sistema de diseño con variables CSS (`--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-error`, `--color-accent`, `--color-success`, `--radius-card`, `--radius-control`).
- **ReviewResponse**: DTO del backend con campos: `id`, `touristId`, `touristName`, `touristEmail`, `experienceId`, `experienceTitle`, `rating` (1-5), `comment`, `createdAt`.
- **ReviewRequest**: DTO para crear una reseña con campos: `experienceId`, `rating` (1-5), `comment` (opcional).

---

## Requisitos

### Requisito 1: Servicio HTTP de Reseñas

**User Story:** Como desarrollador, quiero un servicio Angular centralizado que gestione las peticiones HTTP al endpoint de reseñas, para que la lógica de comunicación con el backend esté encapsulada y sea reutilizable.

#### Criterios de Aceptación

1. THE Reviews_Service SHALL exponer un método `getReviewsByExperience(experienceId: string): Observable<ReviewResponse[]>` que realice una petición GET a `/api/v1/reviews/experiences/{experienceId}/reviews`.
2. THE Reviews_Service SHALL exponer un método `createReview(request: ReviewRequest): Observable<ReviewResponse>` que realice una petición POST a `/api/v1/reviews` con el cuerpo de la solicitud.
3. WHEN el Backend_API responde con error HTTP, THE Reviews_Service SHALL propagar el error para que el componente consumidor lo maneje.

---

### Requisito 2: Lista de Reseñas

**User Story:** Como visitante, quiero ver las reseñas de una experiencia con calificaciones en estrellas, comentarios, nombre del turista y fecha, para que pueda evaluar la calidad de la experiencia antes de reservar.

#### Criterios de Aceptación

1. WHEN el componente Experience_Detail carga una experiencia, THE Review_List SHALL realizar una petición GET a `/api/v1/reviews/experiences/{experienceId}/reviews` y mostrar las reseñas obtenidas.
2. THE Review_List SHALL mostrar para cada reseña: el nombre del turista (`touristName`), la calificación en estrellas usando el componente Star_Rating, el comentario (si existe) y la fecha de creación formateada.
3. WHEN la lista de reseñas está vacía, THE Review_List SHALL mostrar el mensaje "Aún no hay reseñas para esta experiencia".
4. WHILE la petición al Backend_API está en curso, THE Review_List SHALL mostrar un indicador de carga.
5. IF el Backend_API responde con error al obtener las reseñas, THEN THE Review_List SHALL mostrar el mensaje "Error al cargar las reseñas".
6. THE Review_List SHALL ordenar las reseñas por fecha de creación descendente (más recientes primero).

---

### Requisito 3: Formulario de Creación de Reseña

**User Story:** Como turista autenticado con reserva confirmada, quiero poder enviar una reseña con una calificación de 1 a 5 estrellas y un comentario opcional, para que pueda compartir mi experiencia con otros usuarios.

#### Criterios de Aceptación

1. WHEN el usuario está autenticado con rol TOURIST, THE Review_Form SHALL ser visible en la página de detalle de la experiencia.
2. WHEN el usuario no está autenticado o tiene un rol distinto de TOURIST, THE Review_Form SHALL estar oculto.
3. THE Review_Form SHALL contener un selector de calificación en estrellas (1-5) usando el componente Star_Rating en modo interactivo.
4. THE Review_Form SHALL contener un campo de texto opcional para el comentario.
5. WHEN el usuario no ha seleccionado una calificación (rating es 0 o nulo), THE Review_Form SHALL deshabilitar el botón de envío.
6. WHEN el usuario envía el formulario con datos válidos, THE Review_Form SHALL realizar una petición POST a `/api/v1/reviews` con el `experienceId`, `rating` y `comment`.
7. WHEN el Backend_API responde exitosamente tras crear la reseña, THE Review_Form SHALL agregar la nueva reseña a la lista de reseñas sin recargar la página y limpiar el formulario.
8. IF el Backend_API responde con código 403, THEN THE Review_Form SHALL mostrar el mensaje "Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña".
9. IF el Backend_API responde con código 409, THEN THE Review_Form SHALL mostrar el mensaje "Ya has dejado una reseña para esta experiencia" y ocultar el formulario.
10. IF el Backend_API responde con un error distinto de 403 y 409, THEN THE Review_Form SHALL mostrar el mensaje "Error al enviar la reseña. Intenta de nuevo más tarde".
11. WHILE la petición de creación está en curso, THE Review_Form SHALL deshabilitar el botón de envío y mostrar un indicador de carga.

---

### Requisito 4: Componente de Calificación en Estrellas

**User Story:** Como usuario, quiero ver las calificaciones representadas visualmente con estrellas, para que pueda comprender rápidamente la valoración de una experiencia.

#### Criterios de Aceptación

1. THE Star_Rating SHALL ser un componente standalone reutilizable que reciba un valor numérico de calificación (1-5) como `@Input()`.
2. THE Star_Rating SHALL renderizar 5 estrellas donde las estrellas llenas representan la calificación y las vacías el complemento.
3. WHEN el Star_Rating está en modo solo lectura (`readonly = true`), THE Star_Rating SHALL mostrar las estrellas sin permitir interacción.
4. WHEN el Star_Rating está en modo interactivo (`readonly = false`), THE Star_Rating SHALL permitir al usuario hacer clic en una estrella para seleccionar la calificación correspondiente.
5. WHEN el usuario hace clic en una estrella en modo interactivo, THE Star_Rating SHALL emitir el valor seleccionado mediante un `@Output()` de tipo `EventEmitter<number>`.
6. WHEN el usuario pasa el cursor sobre una estrella en modo interactivo, THE Star_Rating SHALL mostrar un efecto visual de hover que indique la calificación que se seleccionaría.
7. THE Star_Rating SHALL usar iconos de estrella con colores del Design_System (`--color-accent` para estrellas llenas, `--color-muted` para estrellas vacías).

---

### Requisito 5: Estadísticas de Reseñas

**User Story:** Como visitante, quiero ver el promedio de calificación y el número total de reseñas de una experiencia, para que pueda tener una visión general rápida de la valoración.

#### Criterios de Aceptación

1. THE Review_Statistics SHALL mostrar el promedio de calificación (`averageRating`) usando el componente Star_Rating en modo solo lectura.
2. THE Review_Statistics SHALL mostrar el número total de reseñas (`reviewCount`) junto al promedio.
3. WHEN el `averageRating` es nulo (no hay reseñas), THE Review_Statistics SHALL mostrar el texto "Sin reseñas aún" en lugar de las estrellas y el conteo.
4. THE Review_Statistics SHALL mostrar el valor numérico del promedio redondeado a un decimal junto a las estrellas.

---

### Requisito 6: Accesibilidad del Módulo de Reseñas

**User Story:** Como usuario con tecnologías de asistencia, quiero que el módulo de reseñas sea accesible, para que pueda interactuar con las calificaciones y reseñas usando lectores de pantalla o navegación por teclado.

#### Criterios de Aceptación

1. THE Star_Rating SHALL tener un atributo `role="radiogroup"` en su contenedor y cada estrella SHALL tener `role="radio"` con `aria-checked` correspondiente.
2. THE Star_Rating en modo interactivo SHALL ser navegable por teclado usando las teclas de flecha izquierda/derecha para cambiar la selección.
3. THE Star_Rating SHALL tener un atributo `aria-label` descriptivo (e.g., "Calificación: 4 de 5 estrellas").
4. THE Review_Form SHALL tener etiquetas `<label>` asociadas a cada campo de entrada mediante el atributo `for`.
5. WHEN el botón de envío del Review_Form está deshabilitado, THE Review_Form SHALL incluir el atributo `aria-disabled="true"`.
6. THE Review_List SHALL tener un encabezado `<h2>` con el texto "Reseñas" para estructurar la sección semánticamente.
7. WHEN se muestra un mensaje de error en el Review_Form, THE Review_Form SHALL usar el atributo `role="alert"` para que los lectores de pantalla lo anuncien.

---

### Requisito 7: Integración con el Design System

**User Story:** Como desarrollador, quiero que todos los componentes del módulo de reseñas usen el design system establecido, para que la experiencia visual sea coherente con el resto de la aplicación.

#### Criterios de Aceptación

1. THE Review_List SHALL usar `var(--color-surface)` y `var(--radius-card)` para el contenedor de cada reseña individual.
2. THE Review_Form SHALL usar `var(--color-surface)`, `var(--color-border)` y `var(--radius-card)` para el contenedor del formulario.
3. THE Review_Form SHALL renderizar el botón de envío con `background: var(--color-primary)` y `border-radius: var(--radius-control)`.
4. WHEN un mensaje de error se muestra en el Review_Form, THE Review_Form SHALL usar `var(--color-error)` para el color del texto.
5. THE Star_Rating SHALL usar `var(--color-accent)` para estrellas llenas y `var(--color-muted)` para estrellas vacías.
6. THE Review_List SHALL usar `var(--color-text)` para el nombre del turista y `var(--color-muted)` para la fecha de creación.

---

### Requisito 8: Manejo de Errores

**User Story:** Como turista, quiero recibir mensajes claros cuando ocurre un error al interactuar con las reseñas, para que pueda entender qué sucedió y qué acción tomar.

#### Criterios de Aceptación

1. IF el Backend_API responde con código 403 al crear una reseña, THEN THE Review_Form SHALL mostrar el mensaje "Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña".
2. IF el Backend_API responde con código 409 al crear una reseña, THEN THE Review_Form SHALL mostrar el mensaje "Ya has dejado una reseña para esta experiencia" y ocultar el formulario.
3. IF el Backend_API responde con un error de red o un código de error no esperado, THEN THE Review_Form SHALL mostrar el mensaje "Error al enviar la reseña. Intenta de nuevo más tarde".
4. IF el Backend_API responde con error al obtener las reseñas, THEN THE Review_List SHALL mostrar el mensaje "Error al cargar las reseñas" y ocultar el indicador de carga.

---

### Requisito 9: Tests Unitarios del Reviews_Service

**User Story:** Como desarrollador, quiero tests unitarios para el Reviews_Service, para que pueda verificar que las peticiones HTTP se construyen correctamente.

#### Criterios de Aceptación

1. THE Reviews_Service SHALL tener un test que verifique que `getReviewsByExperience(experienceId)` realiza una petición GET a `/api/v1/reviews/experiences/{experienceId}/reviews`.
2. THE Reviews_Service SHALL tener un test que verifique que `createReview(request)` realiza una petición POST a `/api/v1/reviews` con el cuerpo correcto.
3. THE Reviews_Service SHALL tener un test que verifique que los errores HTTP se propagan correctamente al suscriptor.

---

### Requisito 10: Tests Unitarios del Star_Rating

**User Story:** Como desarrollador, quiero tests unitarios para el componente Star_Rating, para que pueda verificar que la representación visual y la interacción funcionan correctamente.

#### Criterios de Aceptación

1. THE Star_Rating SHALL tener un test que verifique que se renderizan exactamente 5 estrellas para cualquier valor de rating válido.
2. THE Star_Rating SHALL tener un test de propiedad que verifique que para cualquier valor de rating entre 1 y 5, el número de estrellas llenas es igual al valor de rating (propiedad de consistencia visual).
3. THE Star_Rating SHALL tener un test que verifique que en modo interactivo, al hacer clic en una estrella se emite el valor correspondiente.
4. THE Star_Rating SHALL tener un test que verifique que en modo solo lectura, hacer clic en una estrella no emite ningún evento.
5. THE Star_Rating SHALL tener un test que verifique que la navegación por teclado (flechas izquierda/derecha) cambia la selección en modo interactivo.

---

### Requisito 11: Tests Unitarios del Review_List

**User Story:** Como desarrollador, quiero tests unitarios para el componente Review_List, para que pueda verificar que las reseñas se muestran correctamente.

#### Criterios de Aceptación

1. THE Review_List SHALL tener un test que verifique que se muestra el mensaje de lista vacía cuando no hay reseñas.
2. THE Review_List SHALL tener un test que verifique que se muestra el mensaje de error cuando el backend responde con error.
3. THE Review_List SHALL tener un test de propiedad que verifique que para cualquier lista de reseñas no vacía, todas las reseñas se renderizan en el DOM con nombre del turista, calificación y fecha (propiedad de completitud de renderizado).
4. THE Review_List SHALL tener un test que verifique que las reseñas se muestran ordenadas por fecha descendente.

---

### Requisito 12: Tests Unitarios del Review_Form

**User Story:** Como desarrollador, quiero tests unitarios para el componente Review_Form, para que pueda verificar que la validación, el envío y el manejo de errores funcionan correctamente.

#### Criterios de Aceptación

1. THE Review_Form SHALL tener un test que verifique que el formulario no es visible cuando el usuario no está autenticado.
2. THE Review_Form SHALL tener un test que verifique que el botón de envío está deshabilitado cuando no se ha seleccionado una calificación.
3. THE Review_Form SHALL tener un test que verifique que al enviar exitosamente se limpia el formulario y se agrega la reseña a la lista.
4. THE Review_Form SHALL tener un test que verifique que se muestra el mensaje de error 403 cuando el backend responde con ese código.
5. THE Review_Form SHALL tener un test que verifique que se muestra el mensaje de error 409 y se oculta el formulario cuando el backend responde con ese código.
