# Requirements Document

## Introduction

Integración de mapas interactivos en las experiencias turísticas del sistema Smart Tourism. Se agregan campos de geolocalización (latitude/longitude) a la entidad Experience en el backend y se muestra un mapa interactivo basado en Leaflet + OpenStreetMap en el frontend, tanto en la vista de detalle (modo lectura) como en el formulario de administración (modo edición con click-to-select).

## Glossary

- **Backend**: Aplicación Spring Boot (Java 21, Maven, PostgreSQL, Flyway) que expone la API REST del sistema Smart Tourism
- **Frontend**: Aplicación Angular 21 con standalone components, Bootstrap 5 y Vitest como framework de testing
- **Experience**: Entidad principal que representa una experiencia turística con título, descripción, categoría, ubicación, duración, dificultad, precio e imágenes
- **MapComponent**: Componente Angular reutilizable que renderiza un mapa Leaflet con OpenStreetMap tiles
- **ExperienceForm**: Componente del panel de administración para crear y editar experiencias turísticas
- **ExperienceDetail**: Componente público que muestra la información completa de una experiencia turística
- **Leaflet**: Librería JavaScript de código abierto para mapas interactivos
- **OpenStreetMap**: Proveedor de tiles de mapa gratuito y de código abierto
- **Flyway**: Herramienta de migración de base de datos utilizada en el backend (migraciones V1-V7 existentes)
- **Coordenadas_Santander**: Valores por defecto de latitud 7.1254 y longitud -73.1198 correspondientes a Santander, Colombia

## Requirements

### Requirement 1: Campos de geolocalización en el backend

**User Story:** Como administrador, quiero que las experiencias almacenen coordenadas geográficas, para que se puedan mostrar en un mapa interactivo.

#### Acceptance Criteria

1. THE Backend SHALL almacenar los campos `latitude` (DOUBLE) y `longitude` (DOUBLE) en la tabla `experiences`
2. WHEN se crea una experiencia, THE Backend SHALL requerir valores válidos de latitude y longitude en el request body
3. WHEN se actualiza una experiencia, THE Backend SHALL permitir modificar los valores de latitude y longitude
4. THE Backend SHALL validar que latitude esté en el rango -90.0 a 90.0
5. THE Backend SHALL validar que longitude esté en el rango -180.0 a 180.0
6. IF latitude o longitude están fuera de rango, THEN THE Backend SHALL retornar un error HTTP 400 con mensaje descriptivo
7. WHEN se consulta una experiencia, THE Backend SHALL incluir latitude y longitude en el response body

### Requirement 2: Migración de datos existentes

**User Story:** Como administrador, quiero que las experiencias existentes tengan coordenadas válidas asignadas, para que el mapa funcione sin datos faltantes.

#### Acceptance Criteria

1. THE Backend SHALL incluir una migración Flyway V8 que agregue las columnas `latitude` y `longitude` a la tabla `experiences`
2. THE Backend SHALL asignar el valor 7.1254 como latitude por defecto a las experiencias existentes
3. THE Backend SHALL asignar el valor -73.1198 como longitude por defecto a las experiencias existentes
4. WHEN la migración se ejecuta, THE Backend SHALL definir las columnas latitude y longitude como NOT NULL

### Requirement 3: Componente de mapa reutilizable

**User Story:** Como desarrollador, quiero un componente de mapa reutilizable con modos de lectura y edición, para que se pueda integrar en diferentes vistas sin duplicar código.

#### Acceptance Criteria

1. THE MapComponent SHALL renderizar un mapa Leaflet con tiles de OpenStreetMap
2. THE MapComponent SHALL aceptar un @Input `mode` con valores `readonly` o `edit`
3. THE MapComponent SHALL aceptar @Input `latitude` y `longitude` para posicionar el mapa y el marcador
4. WHILE el modo es `readonly`, THE MapComponent SHALL mostrar un marcador estático en las coordenadas proporcionadas
5. WHILE el modo es `readonly`, THE MapComponent SHALL deshabilitar la interacción de clic para seleccionar ubicación
6. WHILE el modo es `edit`, THE MapComponent SHALL permitir al usuario hacer clic en el mapa para seleccionar una ubicación
7. WHEN el usuario hace clic en el mapa en modo `edit`, THE MapComponent SHALL emitir un evento con las coordenadas seleccionadas (latitude, longitude)
8. WHEN el usuario hace clic en el mapa en modo `edit`, THE MapComponent SHALL mover el marcador a la posición seleccionada

### Requirement 4: Mapa en la vista de detalle de experiencia

**User Story:** Como turista, quiero ver la ubicación de una experiencia en un mapa interactivo, para que pueda visualizar dónde se encuentra geográficamente.

#### Acceptance Criteria

1. WHEN se carga el detalle de una experiencia, THE ExperienceDetail SHALL mostrar el MapComponent en modo `readonly`
2. THE ExperienceDetail SHALL pasar las coordenadas latitude y longitude de la experiencia al MapComponent
3. THE ExperienceDetail SHALL mostrar el mapa con un tamaño visible y responsivo dentro del layout existente

### Requirement 5: Mapa en el formulario de administración

**User Story:** Como administrador, quiero seleccionar la ubicación de una experiencia haciendo clic en un mapa, para que pueda asignar coordenadas de forma visual e intuitiva.

#### Acceptance Criteria

1. THE ExperienceForm SHALL incluir campos de formulario para latitude y longitude
2. THE ExperienceForm SHALL validar que latitude y longitude sean obligatorios
3. THE ExperienceForm SHALL mostrar el MapComponent en modo `edit`
4. WHEN el usuario hace clic en el mapa, THE ExperienceForm SHALL actualizar los campos latitude y longitude del formulario con las coordenadas seleccionadas
5. THE ExperienceForm SHALL permitir al administrador escribir coordenadas manualmente en los campos de texto
6. WHEN el administrador escribe coordenadas manualmente, THE ExperienceForm SHALL actualizar la posición del marcador en el mapa
7. WHILE se edita una experiencia existente, THE ExperienceForm SHALL centrar el mapa en las coordenadas actuales de la experiencia
8. WHILE se crea una nueva experiencia, THE ExperienceForm SHALL centrar el mapa en las Coordenadas_Santander (7.1254, -73.1198)

### Requirement 6: Modelo de datos en el frontend

**User Story:** Como desarrollador, quiero que los modelos TypeScript reflejen los nuevos campos de geolocalización, para que el tipado sea consistente con la API.

#### Acceptance Criteria

1. THE Frontend SHALL incluir los campos `latitude` (number) y `longitude` (number) en la interfaz ExperienceResponse
2. THE Frontend SHALL incluir los campos `latitude` (number) y `longitude` (number) en la interfaz ExperienceRequest
