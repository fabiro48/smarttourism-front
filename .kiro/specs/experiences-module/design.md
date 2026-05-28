# Design Document — Módulo de Experiencias Turísticas (Smart Tourism)

## Overview

Este documento describe el diseño técnico del **Módulo de Experiencias Turísticas** del frontend Angular de Smart Tourism. El módulo implementa el catálogo completo de experiencias: listado paginado con filtros, vista de detalle, tarjeta reutilizable y formulario CRUD para administradores.

### Contexto del módulo

El módulo se integra sobre el scaffolding ya implementado (AuthService, Guards, Interceptor, Navbar, Footer) y consume la API REST del backend Spring Boot en `/api/v1/experiences`.

```
Usuario (TOURIST / ADMIN)
        │
        ▼
  Angular SPA
  ┌─────────────────────────────────────────────────────┐
  │  /experiences          → ExperiencesListComponent   │
  │  /experiences/:id      → ExperienceDetailComponent  │
  │  /experiences/new      → ExperienceFormComponent    │
  │  /experiences/:id/edit → ExperienceFormComponent    │
  └─────────────────────────────────────────────────────┘
        │ HTTP (authInterceptor adjunta Bearer token)
        ▼
  Spring Boot  :8080/api/v1/experiences
  ┌──────────────────────────────────────────────────────┐
  │  GET    /api/v1/experiences          (público)        │
  │  GET    /api/v1/experiences/:id      (público)        │
  │  POST   /api/v1/experiences          (ADMIN)          │
  │  PUT    /api/v1/experiences/:id      (ADMIN)          │
  │  DELETE /api/v1/experiences/:id      (ADMIN)          │
  └──────────────────────────────────────────────────────┘
```

### Decisiones de diseño clave

| Decisión | Elección | Justificación |
|---|---|---|
| Componentes | Standalone (Angular 19+) | Coherente con el scaffolding base; sin NgModules |
| Formularios | Reactive Forms (`FormBuilder`) | Validación programática, fácil de testear |
| Estado de filtros | Propiedades del componente + `debounceTime` | Suficiente para MVP; sin NgRx |
| Paginación | Controlada por el componente (page/size) | El backend ya soporta paginación Spring Data |
| Filtros nulos | Omitidos de `HttpParams` | El backend ignora params ausentes; no enviar ruido |
| Precio | `number` en TypeScript, `BigDecimal` en backend | Formateo COP con `Intl.NumberFormat` en el pipe |
| IDs | `string` en frontend (UUID como string) | Evita dependencia de librería UUID en el frontend |
| Modo form | Detectado por presencia de `id` en la ruta | Un solo componente para crear y editar |
| Confirmación de borrado | `window.confirm()` nativo | Suficiente para MVP; sin modal adicional |

---

## Architecture

### Estructura de archivos

```
smarttourism-front/src/app/
│
├── core/
│   └── models/
│       └── experience.model.ts          ← CREAR: interfaces TypeScript del dominio
│
└── features/
    └── experiences/
        ├── experiences.routes.ts         ← MODIFICAR: añadir rutas de detalle, new, edit
        ├── experiences-list/             ← CREAR
        │   ├── experiences-list.component.ts
        │   ├── experiences-list.component.html
        │   └── experiences-list.component.scss
        ├── experience-detail/            ← CREAR
        │   ├── experience-detail.component.ts
        │   ├── experience-detail.component.html
        │   └── experience-detail.component.scss
        ├── experience-card/              ← CREAR (componente reutilizable)
        │   ├── experience-card.component.ts
        │   ├── experience-card.component.html
        │   └── experience-card.component.scss
        ├── experience-form/              ← CREAR (solo ADMIN)
        │   ├── experience-form.component.ts
        │   ├── experience-form.component.html
        │   └── experience-form.component.scss
        └── services/
            └── experiences.service.ts    ← CREAR
```

### Diagrama de flujo de datos

```
ExperiencesListComponent
  │
  ├── ngOnInit() ──► ExperiencesService.getExperiences(filters, page, size)
  │                        │
  │                        ▼
  │                  HttpClient GET /api/v1/experiences?...
  │                        │
  │                  Page<ExperienceResponse>
  │                        │
  │                  experiences[] + pagination state
  │                        │
  │                  *ngFor ──► ExperienceCardComponent @Input(experience)
  │
  ├── onFilterChange() ──► resetPage(0) ──► loadExperiences()
  ├── onNextPage()     ──► page++ ──► loadExperiences()
  ├── onPrevPage()     ──► page-- ──► loadExperiences()
  └── onDelete(id)     ──► confirm() ──► ExperiencesService.deleteExperience(id)
                                              ──► remove from local array

ExperienceDetailComponent
  │
  └── ngOnInit() ──► route.params ──► ExperiencesService.getExperienceById(id)
                          │
                    ExperienceResponse (con schedules)
                          │
                    Render detalle + horarios

ExperienceFormComponent
  │
  ├── ngOnInit() ──► detectMode() (new vs edit)
  │     │
  │     └── edit mode ──► ExperiencesService.getExperienceById(id) ──► patchValue()
  │
  └── onSubmit()
        ├── create mode ──► ExperiencesService.createExperience(request) ──► navigate(/experiences)
        └── edit mode   ──► ExperiencesService.updateExperience(id, request) ──► navigate(/experiences/:id)
```

---
