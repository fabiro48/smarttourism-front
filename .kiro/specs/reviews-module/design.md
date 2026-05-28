# Documento de Diseño — Módulo de Reseñas

## Overview

El módulo de reseñas es un conjunto de componentes Angular standalone que se integran dentro de la página de detalle de experiencia (`/experiences/:id`). No expone rutas propias visibles al usuario final. Incluye un servicio HTTP centralizado, un componente de estrellas reutilizable, una lista de reseñas y un formulario de creación condicionado al rol TOURIST.

---

## Architecture

### File Structure

```
src/app/features/reviews/
├── reviews.routes.ts                      ← rutas (vacías o redireccionamiento)
├── models/
│   └── review.model.ts                    ← interfaces y DTOs
├── services/
│   └── reviews.service.ts                 ← HTTP service
│   └── reviews.service.spec.ts            ← unit tests
├── star-rating/                           ← Star_Rating (reutilizable)
│   ├── star-rating.component.ts
│   ├── star-rating.component.html
│   ├── star-rating.component.scss
│   └── star-rating.component.spec.ts
├── review-list/                           ← Review_List
│   ├── review-list.component.ts
│   ├── review-list.component.html
│   ├── review-list.component.scss
│   └── review-list.component.spec.ts
├── review-form/                           ← Review_Form
│   ├── review-form.component.ts
│   ├── review-form.component.html
│   ├── review-form.component.scss
│   └── review-form.component.spec.ts
└── review-statistics/                     ← Review_Statistics
    ├── review-statistics.component.ts
    ├── review-statistics.component.html
    └── review-statistics.component.scss
```

---

## Data Models

**Archivo:** `src/app/features/reviews/models/review.model.ts`

```typescript
export interface ReviewResponse {
  id: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  experienceId: string;
  experienceTitle: string;
  rating: number;          // 1-5
  comment: string | null;
  createdAt: string;       // ISO 8601
}

export interface ReviewRequest {
  experienceId: string;
  rating: number;          // 1-5
  comment?: string | null;
}
```

---

## Reviews Service

**Archivo:** `src/app/features/reviews/services/reviews.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reviews`;

  /**
   * Obtiene todas las reseñas de una experiencia.
   * Endpoint: GET /api/v1/reviews/experiences/{experienceId}/reviews
   */
  getReviewsByExperience(experienceId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(
      `${this.baseUrl}/experiences/${experienceId}/reviews`
    );
  }

  /**
   * Crea una nueva reseña.
   * Endpoint: POST /api/v1/reviews
   * Requiere autenticación con rol TOURIST.
   */
  createReview(request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.baseUrl, request);
  }
}
```

---

## Component Designs

### 1. StarRatingComponent

**Selector:** `app-star-rating`
**Standalone:** sí
**Reutilizable:** usado en Review_List, Review_Form y Review_Statistics

#### Inputs / Outputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `@Input() rating` | `number` | `0` | Calificación actual (1-5) |
| `@Input() readonly` | `boolean` | `true` | Si es solo lectura o interactivo |
| `@Output() ratingChange` | `EventEmitter<number>` | — | Emite el nuevo valor al hacer clic |

#### State

| Propiedad | Tipo | Descripción |
|---|---|---|
| `hoverRating` | `number` | Valor de hover temporal (0 si no hay hover) |
| `stars` | `number[]` | Array fijo `[1, 2, 3, 4, 5]` |

#### Template Structure

```html
<div
  class="star-rating"
  role="radiogroup"
  [attr.aria-label]="'Calificación: ' + rating + ' de 5 estrellas'"
>
  @for (star of stars; track star) {
    <button
      type="button"
      class="star"
      [class.filled]="star <= (hoverRating || rating)"
      [class.readonly]="readonly"
      role="radio"
      [attr.aria-checked]="star === rating"
      [attr.aria-label]="star + ' estrella' + (star > 1 ? 's' : '')"
      [disabled]="readonly"
      (click)="onStarClick(star)"
      (mouseenter)="onStarHover(star)"
      (mouseleave)="onStarLeave()"
      (keydown.arrowRight)="onArrowRight()"
      (keydown.arrowLeft)="onArrowLeft()"
    >
      ★
    </button>
  }
</div>
```

#### Behavior

- `onStarClick(value)`: si `!readonly`, emite `ratingChange.emit(value)` y actualiza `rating = value`
- `onStarHover(value)`: si `!readonly`, asigna `hoverRating = value`
- `onStarLeave()`: asigna `hoverRating = 0`
- `onArrowRight()`: incrementa rating (máx 5), emite
- `onArrowLeft()`: decrementa rating (mín 1), emite

#### Styles

```scss
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-muted);
  transition: color 0.15s;

  &.filled {
    color: var(--color-accent);
  }

  &.readonly {
    cursor: default;
    pointer-events: none;
  }
}
```

---

### 2. ReviewListComponent

**Selector:** `app-review-list`
**Standalone:** sí
**Ubicación:** integrado en Experience_Detail

#### Inputs / Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `@Input() experienceId` | `string` | ID de la experiencia para cargar reseñas |

#### State

| Propiedad | Tipo | Descripción |
|---|---|---|
| `reviews` | `ReviewResponse[]` | Lista de reseñas cargadas |
| `isLoading` | `boolean` | Indicador de carga |
| `errorMessage` | `string` | Mensaje de error |

#### Lifecycle

- `ngOnInit()` → llama a `loadReviews()`
- `loadReviews()` → `reviewsService.getReviewsByExperience(experienceId)`, ordena por `createdAt` descendente

#### Public Methods

- `addReview(review: ReviewResponse)` → agrega la reseña al inicio del array (llamado desde el padre tras creación exitosa)

#### Template Structure

```html
<section class="review-list">
  <h2>Reseñas</h2>

  @if (isLoading) {
    <div class="spinner">Cargando reseñas...</div>
  }

  @else if (errorMessage) {
    <p role="alert" class="error-message">{{ errorMessage }}</p>
  }

  @else if (reviews.length === 0) {
    <p class="empty-message">Aún no hay reseñas para esta experiencia</p>
  }

  @else {
    @for (review of reviews; track review.id) {
      <article class="review-card">
        <div class="review-header">
          <span class="tourist-name">{{ review.touristName }}</span>
          <span class="review-date">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
        </div>
        <app-star-rating [rating]="review.rating" [readonly]="true" />
        @if (review.comment) {
          <p class="review-comment">{{ review.comment }}</p>
        }
      </article>
    }
  }
</section>
```

**Imports del componente:** `DatePipe`, `StarRatingComponent`

---

### 3. ReviewFormComponent

**Selector:** `app-review-form`
**Standalone:** sí
**Ubicación:** integrado en Experience_Detail (visible solo para TOURIST autenticado)

#### Inputs / Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `@Input() experienceId` | `string` | ID de la experiencia |
| `@Output() reviewCreated` | `EventEmitter<ReviewResponse>` | Emite la reseña creada exitosamente |

#### State

| Propiedad | Tipo | Descripción |
|---|---|---|
| `rating` | `number` | Calificación seleccionada (0 = no seleccionada) |
| `comment` | `string` | Texto del comentario |
| `isSubmitting` | `boolean` | Envío en curso |
| `errorMessage` | `string` | Mensaje de error |
| `isHidden` | `boolean` | true si se recibe 409 (ya reseñó) |

#### Template Structure

```html
@if (!isHidden) {
  <div class="review-form-container">
    <h3>Deja tu reseña</h3>

    <form (ngSubmit)="onSubmit()" #reviewForm="ngForm">
      <div class="form-group">
        <label id="rating-label">Calificación</label>
        <app-star-rating
          [rating]="rating"
          [readonly]="false"
          (ratingChange)="onRatingChange($event)"
          aria-labelledby="rating-label"
        />
      </div>

      <div class="form-group">
        <label for="review-comment">Comentario (opcional)</label>
        <textarea
          id="review-comment"
          [(ngModel)]="comment"
          name="comment"
          rows="3"
          placeholder="Comparte tu experiencia..."
        ></textarea>
      </div>

      @if (errorMessage) {
        <p role="alert" class="error-message">{{ errorMessage }}</p>
      }

      <button
        type="submit"
        class="btn-primary"
        [disabled]="rating === 0 || isSubmitting"
        [attr.aria-disabled]="rating === 0 || isSubmitting"
      >
        {{ isSubmitting ? 'Enviando...' : 'Enviar reseña' }}
      </button>
    </form>
  </div>
}
```

#### Submit Logic

```typescript
onSubmit(): void {
  if (this.rating === 0 || this.isSubmitting) return;

  this.isSubmitting = true;
  this.errorMessage = '';

  const request: ReviewRequest = {
    experienceId: this.experienceId,
    rating: this.rating,
    comment: this.comment || null
  };

  this.reviewsService.createReview(request).subscribe({
    next: (review) => {
      this.reviewCreated.emit(review);
      this.rating = 0;
      this.comment = '';
      this.isSubmitting = false;
    },
    error: (err) => {
      this.isSubmitting = false;
      if (err.status === 403) {
        this.errorMessage = 'Debes tener una reserva confirmada para esta experiencia antes de dejar una reseña';
      } else if (err.status === 409) {
        this.errorMessage = 'Ya has dejado una reseña para esta experiencia';
        this.isHidden = true;
      } else {
        this.errorMessage = 'Error al enviar la reseña. Intenta de nuevo más tarde';
      }
    }
  });
}
```

**Imports del componente:** `FormsModule`, `StarRatingComponent`

---

### 4. ReviewStatisticsComponent

**Selector:** `app-review-statistics`
**Standalone:** sí
**Ubicación:** integrado en Experience_Detail

#### Inputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `@Input() averageRating` | `number \| null` | Promedio de calificación |
| `@Input() reviewCount` | `number` | Número total de reseñas |

#### Template Structure

```html
<div class="review-statistics">
  @if (averageRating !== null) {
    <app-star-rating [rating]="Math.round(averageRating)" [readonly]="true" />
    <span class="rating-value">{{ averageRating | number:'1.1-1' }}</span>
    <span class="review-count">({{ reviewCount }} reseña{{ reviewCount !== 1 ? 's' : '' }})</span>
  } @else {
    <span class="no-reviews">Sin reseñas aún</span>
  }
</div>
```

**Imports del componente:** `DecimalPipe`, `StarRatingComponent`

---

## Integration with Experience Detail

El componente `ExperienceDetailComponent` (en el módulo de experiencias) importará y usará los componentes de reseñas. La integración se realiza añadiendo las siguientes secciones al template del detalle:

```html
<!-- Dentro de ExperienceDetailComponent template, después de la sección de horarios -->

<!-- Estadísticas de reseñas -->
<app-review-statistics
  [averageRating]="experience.averageRating"
  [reviewCount]="experience.reviewCount"
/>

<!-- Lista de reseñas -->
<app-review-list
  #reviewList
  [experienceId]="experience.id"
/>

<!-- Formulario de reseña (solo TOURIST autenticado) -->
@if (isTourist) {
  <app-review-form
    [experienceId]="experience.id"
    (reviewCreated)="onReviewCreated($event)"
  />
}
```

El `ExperienceDetailComponent` necesitará:
- Importar `ReviewListComponent`, `ReviewFormComponent`, `ReviewStatisticsComponent`
- Agregar propiedad `isTourist: boolean` basada en `authService.getUserRole() === 'TOURIST'`
- Método `onReviewCreated(review)` que llame a `reviewList.addReview(review)` y actualice las estadísticas locales

---

## Component Interaction Diagram

```
ExperienceDetailComponent (/experiences/:id)
  ├── ReviewStatisticsComponent
  │     └── StarRatingComponent (readonly)
  ├── ReviewListComponent
  │     ├── StarRatingComponent (readonly, por cada reseña)
  │     └── ReviewsService.getReviewsByExperience()
  └── ReviewFormComponent (solo si isTourist)
        ├── StarRatingComponent (interactivo)
        ├── ReviewsService.createReview()
        └── @Output reviewCreated → ExperienceDetailComponent
              └── ReviewListComponent.addReview()
```

---

## State Management

Se usa **estado local en cada componente** (propiedades de clase simples). No se introduce ninguna librería de gestión de estado global. Este enfoque es coherente con el patrón establecido en el módulo de experiencias.

La comunicación entre componentes se realiza mediante:
- `@Input()` / `@Output()` para padre-hijo
- `@ViewChild` para que el padre invoque métodos del hijo (e.g., `reviewList.addReview()`)

---

## Design System Integration

| Elemento | Variable CSS |
|---|---|
| Contenedor de reseña individual | `var(--color-surface)`, `var(--radius-card)` |
| Contenedor del formulario | `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)` |
| Botón de envío | `var(--color-primary)`, `var(--radius-control)` |
| Estrellas llenas | `var(--color-accent)` |
| Estrellas vacías | `var(--color-muted)` |
| Nombre del turista | `var(--color-text)` |
| Fecha de reseña | `var(--color-muted)` |
| Mensajes de error | `var(--color-error)` |

---

## Test Strategy

El proyecto usa **Vitest** (no Jasmine/Karma) con `@angular/core/testing` y `HttpTestingController`.

### ReviewsService — `reviews.service.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| `getReviewsByExperience(id)` → GET correcto | Unit | Req 9.1 |
| `createReview(request)` → POST con body correcto | Unit | Req 9.2 |
| Errores HTTP se propagan al suscriptor | Unit | Req 9.3 |

### StarRatingComponent — `star-rating.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| Renderiza exactamente 5 estrellas | Unit | Req 10.1 |
| **P1 — Consistencia visual:** para rating ∈ [1,5], estrellas llenas = rating | PBT | Req 10.2 |
| Click en modo interactivo emite valor | Unit | Req 10.3 |
| Click en modo readonly no emite | Unit | Req 10.4 |
| Navegación por teclado (flechas) cambia selección | Unit | Req 10.5 |

### ReviewListComponent — `review-list.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| Lista vacía → mensaje "Aún no hay reseñas..." | Unit | Req 11.1 |
| Error del backend → mensaje de error | Unit | Req 11.2 |
| **P2 — Completitud de renderizado:** para lista no vacía, todas se renderizan | PBT | Req 11.3 |
| Reseñas ordenadas por fecha descendente | Unit | Req 11.4 |

### ReviewFormComponent — `review-form.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| Formulario oculto si usuario no autenticado | Unit | Req 12.1 |
| Botón deshabilitado si rating = 0 | Unit | Req 12.2 |
| Envío exitoso → limpia formulario y emite evento | Unit | Req 12.3 |
| Error 403 → mensaje de reserva requerida | Unit | Req 12.4 |
| Error 409 → mensaje y oculta formulario | Unit | Req 12.5 |

---

## Correctness Properties

**P1 — Consistencia visual de estrellas (StarRatingComponent):**
> Para todo entero `rating` con `1 ≤ rating ≤ 5`, el número de elementos con clase `.filled` en el DOM es exactamente igual a `rating`.

**P2 — Completitud de renderizado de reseñas (ReviewListComponent):**
> Para toda lista `reviews` con `length > 0`, el número de elementos `<article>` renderizados en el DOM es igual a `reviews.length`, y cada uno contiene el `touristName` correspondiente.

---

## Route Configuration

El módulo de reviews no necesita rutas propias visibles al usuario. Los componentes se integran directamente en `ExperienceDetailComponent`. El archivo `reviews.routes.ts` existente puede mantenerse vacío o redirigir a `/experiences`:

```typescript
// src/app/features/reviews/reviews.routes.ts
import { Routes } from '@angular/router';

export const reviewsRoutes: Routes = [
  { path: '**', redirectTo: '/experiences' }
];
```

> **Nota:** La ruta `/reviews` en `app.routes.ts` se mantiene por compatibilidad pero redirige al listado de experiencias, ya que las reseñas se visualizan dentro del detalle de cada experiencia.
