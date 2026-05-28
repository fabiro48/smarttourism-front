# Design Document — Módulo de Experiencias Turísticas

## Overview

El módulo de experiencias es una feature Angular standalone que expone cuatro vistas principales bajo el prefijo de ruta `/experiences`. Se apoya en un servicio HTTP centralizado, modelos TypeScript tipados y el design system existente. Los componentes ADMIN-only están protegidos por el `adminGuard` existente.

---

## Architecture

### File Structure

```
src/app/features/experiences/
├── experiences.routes.ts                  ← rutas actualizadas
├── models/
│   └── experience.model.ts                ← interfaces y DTOs
├── services/
│   └── experiences.service.ts             ← HTTP service
│   └── experiences.service.spec.ts        ← unit + PBT tests
├── experiences/                           ← Experiences_List (existente, expandido)
│   ├── experiences.component.ts
│   ├── experiences.component.html
│   └── experiences.component.scss
│   └── experiences.component.spec.ts
├── experience-card/                       ← Experience_Card
│   ├── experience-card.component.ts
│   ├── experience-card.component.html
│   └── experience-card.component.scss
│   └── experience-card.component.spec.ts
├── experience-detail/                     ← Experience_Detail
│   ├── experience-detail.component.ts
│   ├── experience-detail.component.html
│   └── experience-detail.component.scss
│   └── experience-detail.component.spec.ts
└── experience-form/                       ← Experience_Form (ADMIN)
    ├── experience-form.component.ts
    ├── experience-form.component.html
    └── experience-form.component.scss
```

---

## Data Models

**Archivo:** `src/app/features/experiences/models/experience.model.ts`

```typescript
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

export interface ScheduleResponse {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
}

export interface ExperienceResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;           // minutos
  difficulty: Difficulty;
  price: number;              // COP
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
  schedules: ScheduleResponse[];
}

export interface ExperienceRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;
  difficulty: Difficulty;
  price: number;
}

export interface ExperienceFilters {
  category?: string | null;
  location?: string | null;
  difficulty?: Difficulty | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  available?: boolean | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // página actual (0-indexed)
  size: number;
}
```

---

## Experiences Service

**Archivo:** `src/app/features/experiences/services/experiences.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ExperiencesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/experiences`;

  getExperiences(
    filters: ExperienceFilters = {},
    page = 0,
    size = 20
  ): Observable<Page<ExperienceResponse>>

  getExperienceById(id: string): Observable<ExperienceResponse>

  createExperience(request: ExperienceRequest): Observable<ExperienceResponse>

  updateExperience(id: string, request: ExperienceRequest): Observable<ExperienceResponse>

  deleteExperience(id: string): Observable<void>
}
```

**Construcción de query params:** `getExperiences` itera sobre las claves de `filters` y solo añade al `HttpParams` aquellas cuyo valor no sea `null` ni `undefined`. Siempre incluye `page` y `size`.

---

## Route Configuration

**Archivo:** `src/app/features/experiences/experiences.routes.ts`

```typescript
export const experiencesRoutes: Routes = [
  {
    path: '',
    component: ExperiencesComponent          // Experiences_List
  },
  {
    path: 'new',
    component: ExperienceFormComponent,
    canActivate: [adminGuard]                // Req 8.13
  },
  {
    path: ':id',
    component: ExperienceDetailComponent    // Experiences_Detail
  },
  {
    path: ':id/edit',
    component: ExperienceFormComponent,
    canActivate: [adminGuard]                // Req 8.14
  }
];
```

> **Nota de orden:** `'new'` debe declararse antes de `':id'` para que el router no interprete "new" como un ID.

---

## Component Designs

### 1. ExperiencesComponent (Experiences_List)

**Selector:** `app-experiences`  
**Ruta:** `/experiences`

#### State (propiedades de clase)

| Propiedad | Tipo | Descripción |
|---|---|---|
| `experiences` | `ExperienceResponse[]` | Resultados de la página actual |
| `isLoading` | `boolean` | Indicador de carga |
| `errorMessage` | `string` | Mensaje de error del backend |
| `currentPage` | `number` | Página actual (0-indexed) |
| `totalPages` | `number` | Total de páginas |
| `totalElements` | `number` | Total de experiencias |
| `pageSize` | `number` | Tamaño de página (20) |
| `filters` | `ExperienceFilters` | Filtros activos |
| `isAdmin` | `boolean` | `authService.getUserRole() === 'ADMIN'` |
| `confirmDeleteId` | `string \| null` | ID de la experiencia pendiente de confirmar borrado |

#### Lifecycle

- `ngOnInit()` → llama a `loadExperiences()` con valores por defecto
- `loadExperiences()` → llama a `experiencesService.getExperiences(filters, currentPage, pageSize)`, actualiza estado
- `onFilterChange()` → resetea `currentPage = 0`, llama a `loadExperiences()`
- `onClearFilters()` → resetea `filters = {}`, `currentPage = 0`, llama a `loadExperiences()`
- `onNextPage()` / `onPrevPage()` → incrementa/decrementa `currentPage`, llama a `loadExperiences()`
- `onDeactivate(id)` → asigna `confirmDeleteId = id`
- `onConfirmDelete()` → llama a `experiencesService.deleteExperience(confirmDeleteId)`, elimina la tarjeta del array local
- `onCancelDelete()` → asigna `confirmDeleteId = null`

#### Template Structure

```html
<main [attr.aria-busy]="isLoading">
  <h1>Experiencias Turísticas</h1>

  <!-- Botón Nueva experiencia (solo ADMIN) -->
  @if (isAdmin) { <button routerLink="/experiences/new">Nueva experiencia</button> }

  <!-- Filter Panel -->
  <section aria-label="Filtros">
    <label for="filter-location">Ubicación</label>
    <input id="filter-location" [(ngModel)]="filters.location" (ngModelChange)="onFilterChange()" />

    <label for="filter-category">Categoría</label>
    <select id="filter-category" [(ngModel)]="filters.category" (ngModelChange)="onFilterChange()">
      <option value="">Todas las categorías</option>
      ...categorías dinámicas...
    </select>

    <label for="filter-difficulty">Dificultad</label>
    <select id="filter-difficulty" [(ngModel)]="filters.difficulty" (ngModelChange)="onFilterChange()">
      <option value="">Cualquier dificultad</option>
      <option value="EASY">Fácil</option>
      <option value="MODERATE">Moderada</option>
      <option value="HARD">Difícil</option>
      <option value="EXTREME">Extrema</option>
    </select>

    <label for="filter-min-price">Precio mínimo</label>
    <input id="filter-min-price" type="number" [(ngModel)]="filters.minPrice" (ngModelChange)="onFilterChange()" />

    <label for="filter-max-price">Precio máximo</label>
    <input id="filter-max-price" type="number" [(ngModel)]="filters.maxPrice" (ngModelChange)="onFilterChange()" />

    <button (click)="onClearFilters()">Limpiar filtros</button>
  </section>

  <!-- Loading -->
  @if (isLoading) { <div class="spinner">Cargando...</div> }

  <!-- Error -->
  @else if (errorMessage) { <p role="alert">{{ errorMessage }}</p> }

  <!-- Empty state -->
  @else if (experiences.length === 0) { <p>No se encontraron experiencias con los filtros seleccionados</p> }

  <!-- Grid de tarjetas -->
  @else {
    <div class="experiences-grid">
      @for (exp of experiences; track exp.id) {
        <app-experience-card
          [experience]="exp"
          [isAdmin]="isAdmin"
          (deactivate)="onDeactivate($event)"
        />
      }
    </div>
  }

  <!-- Pagination (oculto si totalElements <= pageSize) -->
  @if (totalPages > 1) {
    <p>Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ totalElements }} experiencias</p>
    <nav>
      <button aria-label="Página anterior" [disabled]="currentPage === 0" (click)="onPrevPage()">Anterior</button>
      <span>Página {{ currentPage + 1 }} de {{ totalPages }}</span>
      <button aria-label="Página siguiente" [disabled]="currentPage === totalPages - 1" (click)="onNextPage()">Siguiente</button>
    </nav>
  }

  <!-- Diálogo de confirmación de desactivación -->
  @if (confirmDeleteId) {
    <div role="dialog" aria-modal="true">
      <p>¿Desactivar esta experiencia? Esta acción no se puede deshacer fácilmente.</p>
      <button (click)="onConfirmDelete()">Confirmar</button>
      <button (click)="onCancelDelete()">Cancelar</button>
    </div>
  }
</main>
```

**Imports del componente:** `CommonModule`, `FormsModule`, `RouterLink`, `ExperienceCardComponent`

---

### 2. ExperienceCardComponent

**Selector:** `app-experience-card`  
**Standalone:** sí  
**Ruta:** ninguna (componente presentacional)

#### Inputs / Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `@Input() experience` | `ExperienceResponse` | Datos de la experiencia |
| `@Input() isAdmin` | `boolean` | Muestra botones de gestión |
| `@Output() deactivate` | `EventEmitter<string>` | Emite el ID al hacer clic en "Desactivar" |

#### Template Structure

```html
<article
  class="st-card experience-card"
  role="article"
  [attr.aria-label]="'Ver detalle de ' + experience.title"
  (click)="navigateToDetail()"
  (keydown.enter)="navigateToDetail()"
  tabindex="0"
>
  <!-- Imagen o placeholder -->
  <img *ngIf="experience.images.length > 0" [src]="experience.images[0]" [alt]="experience.title" />
  <div *ngIf="experience.images.length === 0" class="img-placeholder" aria-hidden="true"></div>

  <!-- Badge de dificultad -->
  <span class="difficulty-badge" [ngClass]="difficultyClass">{{ difficultyLabel }}</span>

  <h2>{{ experience.title }}</h2>
  <p class="category">{{ experience.category }}</p>
  <p class="location">{{ experience.location }}</p>
  <p class="price">{{ experience.price | currency:'COP':'symbol':'1.0-0' }}</p>
  <p class="rating">
    {{ experience.averageRating !== null ? (experience.averageRating | number:'1.1-1') : 'Sin reseñas' }}
  </p>

  <!-- Botones ADMIN (detienen propagación del click) -->
  @if (isAdmin) {
    <button (click)="onEdit($event)">Editar</button>
    <button (click)="onDeactivate($event)">Desactivar</button>
  }
</article>
```

#### Computed properties

```typescript
get difficultyClass(): string {
  // EASY → 'badge-easy' (--color-success)
  // MODERATE → 'badge-moderate' (--color-accent)
  // HARD | EXTREME → 'badge-hard' (--color-error)
}

get difficultyLabel(): string {
  // EASY → 'Fácil', MODERATE → 'Moderada', HARD → 'Difícil', EXTREME → 'Extrema'
}
```

**Imports del componente:** `CommonModule`, `CurrencyPipe`, `DecimalPipe`, `RouterLink`

---

### 3. ExperienceDetailComponent

**Selector:** `app-experience-detail`  
**Ruta:** `/experiences/:id`

#### State

| Propiedad | Tipo | Descripción |
|---|---|---|
| `experience` | `ExperienceResponse \| null` | Datos cargados |
| `isLoading` | `boolean` | Indicador de carga |
| `errorMessage` | `string` | Error genérico |
| `notFound` | `boolean` | true si el backend responde 404 |

#### Lifecycle

- `ngOnInit()` → lee `route.snapshot.paramMap.get('id')`, llama a `experiencesService.getExperienceById(id)`
- En error: si `err.status === 404` → `notFound = true`; si no → `errorMessage = 'Error al cargar la experiencia...'`

#### Template Structure

```html
<div [attr.aria-busy]="isLoading">

  @if (isLoading) { <div class="spinner">Cargando...</div> }

  @else if (notFound) {
    <p>Experiencia no encontrada</p>
    <a routerLink="/experiences">Volver al listado</a>
  }

  @else if (errorMessage) {
    <p role="alert">{{ errorMessage }}</p>
    <a routerLink="/experiences">Volver al listado</a>
  }

  @else if (experience) {
    <article class="st-card">
      <h1>{{ experience.title }}</h1>

      <!-- Galería -->
      @if (experience.images.length > 0) {
        <div class="gallery">
          @for (img of experience.images; track img) {
            <img [src]="img" [alt]="experience.title" />
          }
        </div>
      } @else {
        <div class="img-placeholder" aria-hidden="true"></div>
      }

      <p>{{ experience.description }}</p>
      <p>Categoría: {{ experience.category }}</p>
      <p>Ubicación: {{ experience.location }}</p>
      <p>Duración: {{ experience.duration }} minutos</p>
      <p>Dificultad: {{ experience.difficulty }}</p>
      <p>Precio: {{ experience.price | currency:'COP':'symbol':'1.0-0' }}</p>

      <!-- Reseñas -->
      <p>
        {{ experience.averageRating !== null
            ? (experience.averageRating | number:'1.1-1') + ' (' + experience.reviewCount + ' reseñas)'
            : 'Sin reseñas aún' }}
      </p>

      <!-- Horarios -->
      <section>
        <h2>Horarios</h2>
        @if (experience.schedules.length === 0) {
          <p>No hay horarios disponibles actualmente</p>
        } @else {
          <ul>
            @for (s of experience.schedules; track s.id) {
              <li>{{ s.dayOfWeek }} — {{ s.startTime }} a {{ s.endTime }} ({{ s.availableSlots }} plazas)</li>
            }
          </ul>
        }
      </section>

      <a routerLink="/experiences" class="btn-outline">Volver al listado</a>
    </article>
  }

</div>
```

**Imports del componente:** `CommonModule`, `CurrencyPipe`, `DecimalPipe`, `RouterLink`

---

### 4. ExperienceFormComponent

**Selector:** `app-experience-form`  
**Rutas:** `/experiences/new` y `/experiences/:id/edit`

#### Mode Detection

El componente detecta el modo en `ngOnInit()` comprobando si la ruta contiene el parámetro `id`:
- Sin `id` → modo **create**
- Con `id` → modo **edit** → carga la experiencia y pre-rellena el formulario

#### State

| Propiedad | Tipo | Descripción |
|---|---|---|
| `form` | `FormGroup` | Formulario reactivo |
| `isEditMode` | `boolean` | true si hay parámetro id |
| `experienceId` | `string \| null` | ID en modo edición |
| `isLoading` | `boolean` | Carga inicial (modo edit) |
| `isSubmitting` | `boolean` | Envío en curso |
| `errorMessage` | `string` | Error del backend |

#### Form Definition

```typescript
form = this.fb.group({
  title:       ['', [Validators.required]],
  description: ['', [Validators.required]],
  category:    ['', [Validators.required]],
  location:    ['', [Validators.required]],
  duration:    [null, [Validators.required, Validators.min(1)]],
  difficulty:  ['', [Validators.required]],
  price:       [null, [Validators.required, Validators.min(0)]]
});
```

#### Submit Logic

- **Create:** POST → navega a `/experiences`
- **Edit:** PUT → navega a `/experiences/:id`
- En error: muestra `errorMessage`, mantiene datos del formulario, `isSubmitting = false`
- Mientras envía: `isSubmitting = true`, botón deshabilitado con `aria-disabled="true"`

#### Template Structure

```html
<div class="st-card">
  <h1>{{ isEditMode ? 'Editar experiencia' : 'Nueva experiencia' }}</h1>

  @if (isLoading) { <div class="spinner">Cargando...</div> }

  @else {
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

      <label for="exp-title">Título</label>
      <input id="exp-title" formControlName="title" />
      @if (title.invalid && title.touched) {
        <span style="color: var(--color-error)">El título es requerido</span>
      }

      <!-- ... campos: description, category, location, duration, difficulty, price ... -->

      @if (errorMessage) { <p role="alert" style="color: var(--color-error)">{{ errorMessage }}</p> }

      <button
        type="submit"
        [disabled]="isSubmitting"
        [attr.aria-disabled]="isSubmitting"
      >
        {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar cambios' : 'Crear experiencia') }}
      </button>

    </form>
  }
</div>
```

**Imports del componente:** `ReactiveFormsModule`, `CommonModule`

---

## Component Interaction Diagram

```
app.routes.ts
  └── /experiences (authGuard) → experiencesRoutes
        ├── ''          → ExperiencesComponent
        │     └── uses ExperienceCardComponent (presentational)
        │           ├── @Output deactivate → ExperiencesComponent.onDeactivate()
        │           └── click → Router.navigate(['/experiences', id])
        ├── 'new'       → ExperienceFormComponent (adminGuard)
        ├── ':id'       → ExperienceDetailComponent
        └── ':id/edit'  → ExperienceFormComponent (adminGuard)

ExperiencesComponent
  └── ExperiencesService.getExperiences()
  └── ExperiencesService.deleteExperience()

ExperienceDetailComponent
  └── ExperiencesService.getExperienceById()

ExperienceFormComponent
  └── ExperiencesService.getExperienceById()  (modo edit)
  └── ExperiencesService.createExperience()   (modo create)
  └── ExperiencesService.updateExperience()   (modo edit)
```

---

## State Management

Se usa **estado local en cada componente** (propiedades de clase simples). No se introduce ninguna librería de gestión de estado global. Este enfoque es coherente con el patrón ya establecido en `LoginComponent` y `RegisterComponent`.

Los filtros del listado se mantienen como un objeto `ExperienceFilters` en el componente. Cada cambio de filtro dispara una nueva petición HTTP; no se usa debounce en esta versión para mantener la implementación simple y alineada con los requisitos.

---

## Design System Integration

| Elemento | Variable CSS |
|---|---|
| Fondo de página (list) | `var(--color-bg)` |
| Tarjeta (card, detail, form) | `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)` |
| Botón primario | `var(--color-primary)`, `var(--radius-control)` |
| Badge EASY | `var(--color-success)` |
| Badge MODERATE | `var(--color-accent)` |
| Badge HARD / EXTREME | `var(--color-error)` |
| Mensajes de error de validación | `var(--color-error)` |

---

## Test Strategy

El proyecto usa **Vitest** (no Jasmine/Karma) con `@angular/core/testing` y `HttpTestingController`.

### ExperiencesService — `experiences.service.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| `getExperiences()` sin filtros → GET con page=0, size=20 | Unit | Req 9.1 |
| `getExperiences()` con filtros → solo params no nulos en URL | Unit | Req 9.2 |
| `getExperienceById(id)` → GET `/experiences/{id}` | Unit | Req 9.3 |
| `createExperience(req)` → POST con body correcto | Unit | Req 9.4 |
| `updateExperience(id, req)` → PUT con body correcto | Unit | Req 9.5 |
| `deleteExperience(id)` → DELETE `/experiences/{id}` | Unit | Req 9.6 |
| **P1 — Completitud de filtros:** para cualquier `ExperienceFilters` con valores no nulos, todos aparecen como query params | PBT | Req 9.7 |

**Propiedad P1 (PBT):** Se generan objetos `ExperienceFilters` con valores arbitrarios no nulos. Para cada combinación se verifica que la URL de la petición contiene exactamente esos parámetros. Se implementa con un array de casos representativos (sin librería externa de PBT) que cubra el espacio de combinaciones relevantes.

### ExperiencesComponent — `experiences.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| `ngOnInit` → petición con page=0, size=20 | Unit | Req 10.1 |
| Cambio de filtro → resetea page a 0 | Unit | Req 10.2 |
| Botón "Siguiente" deshabilitado en última página | Unit | Req 10.3 |
| Botón "Anterior" deshabilitado en primera página | Unit | Req 10.4 |
| Backend retorna `content: []` → mensaje vacío | Unit | Req 10.5 |
| Backend retorna error HTTP → mensaje de error | Unit | Req 10.6 |
| **P2 — Consistencia de paginación:** para cualquier `n` (0 ≤ n < totalPages), navegar a esa página emite petición con `page=n` | PBT | Req 10.7 |

### ExperienceCardComponent — `experience-card.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| Renderiza título, categoría, ubicación y precio | Unit | Req 11.1 |
| `averageRating` nulo → muestra "Sin reseñas" | Unit | Req 11.2 |
| `images` vacío → muestra placeholder | Unit | Req 11.3 |
| Click en tarjeta → navega a `/experiences/{id}` | Unit | Req 11.4 |
| **P3 — Formato de calificación:** para cualquier `averageRating` ∈ [0, 5], el valor mostrado es redondeado a 1 decimal | PBT | Req 11.5 |

### ExperienceDetailComponent — `experience-detail.component.spec.ts`

| Test | Tipo | Requisito |
|---|---|---|
| `ngOnInit` → GET con ID de la ruta | Unit | Req 12.1 |
| Backend exitoso → todos los campos visibles | Unit | Req 12.2 |
| Backend 404 → "Experiencia no encontrada" | Unit | Req 12.3 |
| Backend error ≠ 404 → mensaje de error genérico | Unit | Req 12.4 |
| `schedules` vacío → "No hay horarios disponibles actualmente" | Unit | Req 12.5 |
| **P4 — Completitud de horarios:** para cualquier lista de schedules no vacía, todos se renderizan en el DOM | PBT | Req 12.6 |

---

## Correctness Properties

Las siguientes propiedades formales deben mantenerse en todo momento:

**P1 — Completitud de filtros (ExperiencesService):**
> Para todo objeto `filters` donde cada campo tiene un valor no nulo/undefined, la URL de la petición GET contiene exactamente esos campos como query params.

**P2 — Consistencia de paginación (ExperiencesComponent):**
> Para todo entero `n` con `0 ≤ n < totalPages`, si el usuario navega a la página `n`, el componente realiza la petición con `page=n`.

**P3 — Formato de calificación (ExperienceCardComponent):**
> Para todo `averageRating` ∈ [0.0, 5.0], el texto mostrado en el DOM es `averageRating` redondeado a exactamente 1 decimal.

**P4 — Completitud de renderizado de horarios (ExperienceDetailComponent):**
> Para toda lista `schedules` con `length > 0`, el número de elementos `<li>` renderizados en el DOM es igual a `schedules.length`.
