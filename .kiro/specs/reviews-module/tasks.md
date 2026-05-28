# Tasks — Módulo de Reseñas

## Task 1: Crear modelos e interfaces TypeScript
- [x] Crear archivo `src/app/features/reviews/models/review.model.ts`
- [x] Definir interfaz `ReviewResponse` con campos: `id`, `touristId`, `touristName`, `touristEmail`, `experienceId`, `experienceTitle`, `rating` (number 1-5), `comment` (string | null), `createdAt` (string)
- [x] Definir interfaz `ReviewRequest` con campos: `experienceId` (string), `rating` (number 1-5), `comment` (string | null, opcional)

## Task 2: Implementar ReviewsService HTTP
- [x] Crear archivo `src/app/features/reviews/services/reviews.service.ts`
- [x] Implementar método `getReviewsByExperience(experienceId: string): Observable<ReviewResponse[]>` que haga GET a `${environment.apiUrl}/reviews/experiences/${experienceId}/reviews`
- [x] Implementar método `createReview(request: ReviewRequest): Observable<ReviewResponse>` que haga POST a `${environment.apiUrl}/reviews`
- [x] Usar `inject(HttpClient)` y `environment.apiUrl` siguiendo el patrón de `ExperiencesService`

## Task 3: Implementar StarRatingComponent
- [x] Crear componente standalone `src/app/features/reviews/star-rating/star-rating.component.ts`
- [x] Definir `@Input() rating: number = 0` y `@Input() readonly: boolean = true`
- [x] Definir `@Output() ratingChange = new EventEmitter<number>()`
- [x] Renderizar 5 estrellas con clase `.filled` para estrellas ≤ rating
- [x] En modo interactivo: click selecciona rating y emite evento, hover muestra efecto visual
- [x] En modo readonly: deshabilitar interacción (pointer-events: none)
- [x] Implementar navegación por teclado (ArrowLeft/ArrowRight) en modo interactivo
- [x] Agregar `role="radiogroup"` al contenedor y `role="radio"` con `aria-checked` a cada estrella
- [x] Agregar `aria-label` descriptivo al contenedor ("Calificación: X de 5 estrellas")
- [x] Usar `var(--color-accent)` para estrellas llenas y `var(--color-muted)` para vacías

## Task 4: Implementar ReviewListComponent
- [x] Crear componente standalone `src/app/features/reviews/review-list/review-list.component.ts`
- [x] Definir `@Input() experienceId: string`
- [x] En `ngOnInit()`, llamar a `reviewsService.getReviewsByExperience(experienceId)` y ordenar por `createdAt` descendente
- [x] Mostrar indicador de carga mientras la petición está en curso
- [x] Mostrar mensaje "Aún no hay reseñas para esta experiencia" si la lista está vacía
- [x] Mostrar mensaje "Error al cargar las reseñas" si el backend responde con error
- [x] Para cada reseña: mostrar `touristName`, `StarRatingComponent` (readonly), `comment` (si existe), `createdAt` formateado con DatePipe
- [x] Exponer método público `addReview(review: ReviewResponse)` que inserte al inicio del array
- [x] Usar `var(--color-surface)` y `var(--radius-card)` para cada tarjeta de reseña
- [x] Usar `var(--color-text)` para nombre y `var(--color-muted)` para fecha
- [x] Agregar `<h2>Reseñas</h2>` como encabezado de la sección

## Task 5: Implementar ReviewFormComponent
- [x] Crear componente standalone `src/app/features/reviews/review-form/review-form.component.ts`
- [x] Definir `@Input() experienceId: string` y `@Output() reviewCreated = new EventEmitter<ReviewResponse>()`
- [x] Incluir `StarRatingComponent` en modo interactivo para seleccionar calificación
- [x] Incluir textarea opcional para comentario con `<label for="review-comment">`
- [x] Deshabilitar botón de envío si `rating === 0` o `isSubmitting === true`, con `aria-disabled`
- [x] En submit: llamar a `reviewsService.createReview()` con `experienceId`, `rating` y `comment`
- [x] En respuesta exitosa: emitir `reviewCreated`, limpiar formulario (rating=0, comment='')
- [x] En error 403: mostrar "Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña"
- [x] En error 409: mostrar "Ya has dejado una reseña para esta experiencia" y ocultar formulario (`isHidden = true`)
- [x] En otro error: mostrar "Error al enviar la reseña. Intenta de nuevo más tarde"
- [x] Usar `role="alert"` en mensajes de error
- [x] Usar `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)` para contenedor
- [x] Usar `var(--color-primary)` y `var(--radius-control)` para botón de envío
- [x] Usar `var(--color-error)` para mensajes de error

## Task 6: Implementar ReviewStatisticsComponent
- [x] Crear componente standalone `src/app/features/reviews/review-statistics/review-statistics.component.ts`
- [x] Definir `@Input() averageRating: number | null` y `@Input() reviewCount: number`
- [x] Si `averageRating` no es null: mostrar `StarRatingComponent` (readonly) con `Math.round(averageRating)`, valor numérico redondeado a 1 decimal, y conteo de reseñas
- [x] Si `averageRating` es null: mostrar "Sin reseñas aún"

## Task 7: Integrar componentes de reseñas en ExperienceDetailComponent
> **Depends on:** Task 3, Task 4, Task 5, Task 6
- [x] Importar `ReviewListComponent`, `ReviewFormComponent`, `ReviewStatisticsComponent` en `ExperienceDetailComponent`
- [x] Agregar propiedad `isTourist: boolean` basada en `authService.getUserRole() === 'TOURIST'`
- [x] Agregar `<app-review-statistics>` con bindings `[averageRating]` y `[reviewCount]` del `ExperienceResponse`
- [x] Agregar `<app-review-list>` con `[experienceId]` y referencia `#reviewList`
- [x] Agregar `<app-review-form>` condicionado a `isTourist`, con `[experienceId]` y `(reviewCreated)="onReviewCreated($event)"`
- [x] Implementar `onReviewCreated(review)`: llamar a `reviewList.addReview(review)` y actualizar `experience.reviewCount` y `experience.averageRating` localmente
- [x] Actualizar `reviews.routes.ts` para redirigir a `/experiences` (las reseñas se ven en el detalle)

## Task 8: Tests unitarios del ReviewsService
> **Depends on:** Task 2
- [x] Crear archivo `src/app/features/reviews/services/reviews.service.spec.ts`
- [x] Test: `getReviewsByExperience(id)` realiza GET a la URL correcta
- [x] Test: `createReview(request)` realiza POST con body correcto
- [x] Test: errores HTTP se propagan al suscriptor
- [x] Usar `HttpTestingController` de `@angular/common/http/testing`

## Task 9: Tests unitarios del StarRatingComponent
> **Depends on:** Task 3
- [x] Crear archivo `src/app/features/reviews/star-rating/star-rating.component.spec.ts`
- [x] Test: renderiza exactamente 5 estrellas
- [x] Test PBT (P1): para rating ∈ [1,5], número de estrellas con clase `.filled` === rating
- [x] Test: click en modo interactivo emite valor correspondiente
- [x] Test: click en modo readonly no emite evento
- [x] Test: navegación por teclado (ArrowRight/ArrowLeft) cambia selección

## Task 10: Tests unitarios del ReviewListComponent
> **Depends on:** Task 4
- [x] Crear archivo `src/app/features/reviews/review-list/review-list.component.spec.ts`
- [x] Test: muestra mensaje de lista vacía cuando no hay reseñas
- [x] Test: muestra mensaje de error cuando el backend falla
- [x] Test PBT (P2): para lista no vacía, todas las reseñas se renderizan con touristName
- [x] Test: reseñas se muestran ordenadas por fecha descendente

## Task 11: Tests unitarios del ReviewFormComponent
> **Depends on:** Task 5
- [x] Crear archivo `src/app/features/reviews/review-form/review-form.component.spec.ts`
- [x] Test: formulario oculto si usuario no autenticado como TOURIST
- [x] Test: botón deshabilitado si rating === 0
- [x] Test: envío exitoso limpia formulario y emite evento
- [x] Test: error 403 muestra mensaje de reserva requerida
- [x] Test: error 409 muestra mensaje y oculta formulario
