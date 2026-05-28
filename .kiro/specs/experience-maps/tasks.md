# Implementation Plan: Experience Maps

## Overview

Implementación de geolocalización en experiencias turísticas. Se extiende el backend con campos latitude/longitude (migración Flyway V8, validación Jakarta) y se crea un MapComponent reutilizable en Angular con Leaflet + OpenStreetMap, integrado en ExperienceDetail (lectura) y ExperienceForm (edición bidireccional).

## Tasks

- [x] 1. Backend: Migración y modelo de datos
  - [x] 1.1 Crear migración Flyway V8 para agregar columnas de geolocalización
    - Crear archivo `V8__add_geolocation_to_experiences.sql` en `src/main/resources/db/migration/`
    - ALTER TABLE experiences ADD COLUMN latitude DOUBLE PRECISION NOT NULL DEFAULT 7.1254
    - ALTER TABLE experiences ADD COLUMN longitude DOUBLE PRECISION NOT NULL DEFAULT -73.1198
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Extender la entidad Experience con campos latitude y longitude
    - Agregar campos `latitude` (Double) y `longitude` (Double) a `Experience.java`
    - Agregar anotaciones `@Column(nullable = false)`, `@Min(-90)`, `@Max(90)` para latitude
    - Agregar anotaciones `@Column(nullable = false)`, `@Min(-180)`, `@Max(180)` para longitude
    - Archivo: `src/main/java/com/smarttourism/backend/experiences/entity/Experience.java`
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 1.3 Extender ExperienceRequest DTO con validación de coordenadas
    - Agregar campos `latitude` y `longitude` con `@NotNull`, `@DecimalMin`, `@DecimalMax`
    - Mensajes de error en español según diseño
    - Archivo: `src/main/java/com/smarttourism/backend/experiences/dto/ExperienceRequest.java`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.4 Extender ExperienceResponse DTO con campos de coordenadas
    - Agregar campos `latitude` (Double) y `longitude` (Double)
    - Archivo: `src/main/java/com/smarttourism/backend/experiences/dto/ExperienceResponse.java`
    - _Requirements: 1.7_

  - [x] 1.5 Actualizar mapper/service para mapear latitude y longitude entre entidad y DTOs
    - Asegurar que el servicio de experiencias mapea los nuevos campos en create, update y read
    - _Requirements: 1.2, 1.3, 1.7_

  - [ ]* 1.6 Escribir property test para validación de rango de coordenadas
    - **Property 1: Coordinate range validation**
    - Generar pares (lat, lng) aleatorios y verificar que el backend acepta solo los que están en rango válido
    - **Validates: Requirements 1.4, 1.5, 1.6**

  - [ ]* 1.7 Escribir property test para round-trip de coordenadas
    - **Property 2: Coordinate persistence round-trip**
    - Crear experiencia con coordenadas válidas y verificar que GET retorna los mismos valores
    - **Validates: Requirements 1.2, 1.3, 1.7**

- [x] 2. Checkpoint - Verificar backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Frontend: Instalar Leaflet y crear MapComponent
  - [x] 3.1 Instalar dependencia Leaflet en el proyecto Angular
    - Ejecutar `npm install leaflet` y `npm install -D @types/leaflet`
    - Agregar estilos de Leaflet en `angular.json` (styles array): `node_modules/leaflet/dist/leaflet.css`
    - _Requirements: 3.1_

  - [x] 3.2 Crear MapComponent standalone en shared/components/map/
    - Crear `map.component.ts`, `map.component.html`, `map.component.scss`
    - Ubicación: `src/app/shared/components/map/`
    - Implementar @Input: `mode` ('readonly' | 'edit'), `latitude` (default 7.1254), `longitude` (default -73.1198), `zoom` (default 13)
    - Implementar @Output: `coordinateSelected` EventEmitter<{latitude: number, longitude: number}>
    - Inicializar mapa Leaflet con tiles OpenStreetMap en OnInit
    - Agregar marcador en las coordenadas proporcionadas
    - En modo `edit`: registrar click handler que mueve marcador y emite evento
    - En modo `readonly`: no registrar click handler
    - Implementar OnChanges para actualizar posición del marcador cuando cambian los inputs
    - Implementar OnDestroy para limpiar el mapa
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 3.3 Escribir unit tests para MapComponent
    - Verificar que el componente se crea correctamente
    - Verificar que emite coordinateSelected en modo edit al simular click
    - Verificar que no emite en modo readonly
    - _Requirements: 3.2, 3.6, 3.7_

- [x] 4. Frontend: Actualizar modelos y vistas
  - [x] 4.1 Agregar campos latitude y longitude a los modelos TypeScript
    - Agregar `latitude: number` y `longitude: number` a `ExperienceResponse`
    - Agregar `latitude: number` y `longitude: number` a `ExperienceRequest`
    - Archivo: `src/app/features/experiences/models/experience.model.ts`
    - _Requirements: 6.1, 6.2_

  - [x] 4.2 Integrar MapComponent en ExperienceDetail (modo readonly)
    - Importar MapComponent en ExperienceDetail
    - Agregar `<app-map>` al template con `[mode]="'readonly'"`, `[latitude]` y `[longitude]` bindeados a la experiencia
    - Aplicar estilos responsivos al contenedor del mapa
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.3 Integrar MapComponent en ExperienceForm (modo edit con sync bidireccional)
    - Importar MapComponent en ExperienceForm
    - Agregar controles `latitude` y `longitude` al FormGroup con Validators.required, min/max
    - Agregar `<app-map>` al template con `[mode]="'edit'"` y bindings a los form controls
    - Implementar handler para `(coordinateSelected)` que actualiza los form controls
    - Agregar inputs de texto para latitude y longitude con binding al FormGroup
    - Implementar valueChanges subscription para actualizar el mapa cuando se escriben coordenadas manualmente
    - En modo edición: centrar mapa en coordenadas existentes de la experiencia
    - En modo creación: centrar mapa en Coordenadas_Santander (7.1254, -73.1198)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 4.4 Escribir unit tests para ExperienceForm (validación de coordenadas)
    - **Property 7: ExperienceForm coordinate required validation**
    - Verificar que el formulario es inválido cuando latitude o longitude están vacíos
    - Verificar que el submit está deshabilitado con coordenadas faltantes
    - **Validates: Requirements 5.1, 5.2**

- [x] 5. Final checkpoint - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Backend uses Java 21 + Spring Boot + Maven; Frontend uses Angular 21 + TypeScript + Vitest
- Flyway migrations V1-V7 already exist; this feature adds V8
- Leaflet CSS must be added to angular.json styles array for proper rendering
- MapComponent uses ChangeDetectionStrategy.OnPush for performance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "3.2"] },
    { "id": 3, "tasks": ["1.6", "1.7", "3.3", "4.2", "4.3"] },
    { "id": 4, "tasks": ["4.4"] }
  ]
}
```
