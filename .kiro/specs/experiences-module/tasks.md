# Implementation Tasks — Módulo de Experiencias Turísticas

## Tasks

- [x] 1. Crear modelos TypeScript del módulo
  - [x] 1.1 Crear el archivo `src/app/features/experiences/models/experience.model.ts` con las interfaces `Difficulty`, `ScheduleResponse`, `ExperienceResponse`, `ExperienceRequest`, `ExperienceFilters` y `Page<T>`
  - _Validates: Requirements 1, 2, 4, 5, 8_

- [x] 2. Implementar ExperiencesService
  - [x] 2.1 Crear `src/app/features/experiences/services/experiences.service.ts` con los métodos `getExperiences`, `getExperienceById`, `createExperience`, `updateExperience` y `deleteExperience`
  - [x] 2.2 Implementar la lógica de construcción de `HttpParams` que omite filtros nulos/undefined
  - [x] 2.3 Crear `src/app/features/experiences/services/experiences.service.spec.ts` con los tests unitarios y la propiedad PBT P1 (completitud de filtros)
  - _Validates: Requirements 1, 9_

- [x] 3. Implementar ExperienceCardComponent
  - [x] 3.1 Crear `src/app/features/experiences/experience-card/experience-card.component.ts` como componente standalone con `@Input() experience`, `@Input() isAdmin` y `@Output() deactivate`
  - [x] 3.2 Crear el template `experience-card.component.html` con imagen/placeholder, badge de dificultad, título, categoría, ubicación, precio formateado en COP, calificación y botones ADMIN condicionales
  - [x] 3.3 Crear `experience-card.component.scss` usando `var(--color-surface)`, `var(--color-border)`, `var(--radius-card)` y los colores de dificultad del design system
  - [x] 3.4 Crear `experience-card.component.spec.ts` con los tests unitarios y la propiedad PBT P3 (formato de calificación)
  - _Validates: Requirements 4, 6, 7, 11_

- [x] 4. Implementar ExperiencesComponent (Experiences_List)
  - [x] 4.1 Expandir `src/app/features/experiences/experiences/experiences.component.ts` con el estado completo (filtros, paginación, isLoading, errorMessage, isAdmin, confirmDeleteId) y los métodos del ciclo de vida
  - [x] 4.2 Reemplazar `experiences.component.html` con el template completo: `<h1>`, Filter_Panel con todos los controles y labels, grid de tarjetas, estados de carga/error/vacío, Pagination_Controls y diálogo de confirmación de desactivación
  - [x] 4.3 Crear `experiences.component.scss` con el fondo `var(--color-bg)` y el layout del grid
  - [x] 4.4 Crear `experiences.component.spec.ts` con los tests unitarios y la propiedad PBT P2 (consistencia de paginación)
  - _Validates: Requirements 2, 3, 6, 7, 8, 10_

- [x] 5. Implementar ExperienceDetailComponent
  - [x] 5.1 Crear `src/app/features/experiences/experience-detail/experience-detail.component.ts` que lee el parámetro `id` de la ruta y carga la experiencia con manejo diferenciado de error 404 vs otros errores
  - [x] 5.2 Crear `experience-detail.component.html` con el template completo: galería de imágenes/placeholder, todos los campos del detalle, sección de horarios con estado vacío, calificación/reseñas, botón "Volver al listado" y estados de carga/error/notFound
  - [x] 5.3 Crear `experience-detail.component.scss` usando las variables del design system
  - [x] 5.4 Crear `experience-detail.component.spec.ts` con los tests unitarios y la propiedad PBT P4 (completitud de renderizado de horarios)
  - _Validates: Requirements 5, 6, 7, 12_

- [x] 6. Implementar ExperienceFormComponent
  - [x] 6.1 Crear `src/app/features/experiences/experience-form/experience-form.component.ts` con detección de modo (create/edit), formulario reactivo con todos los campos y validaciones, y lógica de submit diferenciada por modo
  - [x] 6.2 Crear `experience-form.component.html` con todos los campos del formulario, labels asociados con `for`, mensajes de error de validación con `var(--color-error)`, indicador de carga y botón de submit con `aria-disabled`
  - [x] 6.3 Crear `experience-form.component.scss` usando las variables del design system
  - _Validates: Requirements 6, 7, 8_

- [x] 7. Actualizar la configuración de rutas
  - [x] 7.1 Reemplazar el contenido de `src/app/features/experiences/experiences.routes.ts` con las cuatro rutas: `''` (lista), `'new'` (form + adminGuard), `':id'` (detalle), `':id/edit'` (form + adminGuard), asegurando que `'new'` precede a `':id'`
  - _Validates: Requirements 8.13, 8.14_

- [x] 8. Verificación de integración y build
  - [x] 8.1 Ejecutar `ng build` y corregir cualquier error de compilación TypeScript o de templates
  - [x] 8.2 Ejecutar `ng test` (Vitest) y verificar que todos los tests unitarios y PBT pasan
  - _Validates: Requirements 9, 10, 11, 12_
