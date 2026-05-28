# Design Document

## Architecture Overview

La funcionalidad de mapas de experiencias se implementa como una extensión vertical que atraviesa backend y frontend:

- **Backend**: Se agregan campos `latitude` y `longitude` a la entidad `Experience`, con validación Jakarta y migración Flyway V8.
- **Frontend**: Se crea un `MapComponent` reutilizable en `shared/components/map/` que encapsula Leaflet + OpenStreetMap, y se integra en `ExperienceDetail` (modo lectura) y `ExperienceForm` (modo edición con sincronización bidireccional).

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Angular 21)                 │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ ExperienceDetail │    │      ExperienceForm          │  │
│  │  (readonly map)  │    │  (edit map + form fields)    │  │
│  └────────┬─────────┘    └──────────────┬───────────────┘  │
│           │                             │                   │
│           └──────────┐   ┌──────────────┘                   │
│                      ▼   ▼                                  │
│              ┌───────────────────┐                           │
│              │   MapComponent    │                           │
│              │ (shared/components│                           │
│              │  /map/)           │                           │
│              │ Inputs: lat, lng, │                           │
│              │         mode      │                           │
│              │ Output:           │                           │
│              │  coordinateSelected│                          │
│              └───────────────────┘                           │
│                      │                                      │
│              ┌───────┴───────┐                              │
│              │   Leaflet +   │                              │
│              │ OpenStreetMap │                              │
│              └───────────────┘                              │
└─────────────────────────────────────────────────────────────┘
                         │ HTTP
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │ExperienceRequest│  │ExperienceResponse│  │Experience │  │
│  │ + latitude     │  │ + latitude       │  │Entity     │  │
│  │ + longitude    │  │ + longitude      │  │+ latitude │  │
│  └────────────────┘  └──────────────────┘  │+ longitude│  │
│                                             └───────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Flyway V8: ALTER TABLE experiences                  │   │
│  │    ADD latitude DOUBLE NOT NULL DEFAULT 7.1254       │   │
│  │    ADD longitude DOUBLE NOT NULL DEFAULT -73.1198    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Backend: Experience Entity Extension

**Archivo:** `Experience.java`

Se agregan dos campos con validación de rango:

```java
@Column(nullable = false)
@Min(-90) @Max(90)
private Double latitude;

@Column(nullable = false)
@Min(-180) @Max(180)
private Double longitude;
```

### 2. Backend: ExperienceRequest DTO Extension

**Archivo:** `ExperienceRequest.java`

```java
@NotNull(message = "La latitud es obligatoria")
@DecimalMin(value = "-90.0", message = "La latitud debe ser >= -90")
@DecimalMax(value = "90.0", message = "La latitud debe ser <= 90")
private Double latitude;

@NotNull(message = "La longitud es obligatoria")
@DecimalMin(value = "-180.0", message = "La longitud debe ser >= -180")
@DecimalMax(value = "180.0", message = "La longitud debe ser <= 180")
private Double longitude;
```

### 3. Backend: ExperienceResponse DTO Extension

**Archivo:** `ExperienceResponse.java`

```java
private Double latitude;
private Double longitude;
```

### 4. Backend: Flyway Migration V8

**Archivo:** `V8__add_geolocation_to_experiences.sql`

```sql
ALTER TABLE experiences
    ADD COLUMN latitude DOUBLE PRECISION NOT NULL DEFAULT 7.1254,
    ADD COLUMN longitude DOUBLE PRECISION NOT NULL DEFAULT -73.1198;
```

### 5. Frontend: MapComponent

**Ubicación:** `src/app/shared/components/map/`

Componente standalone Angular que encapsula Leaflet:

```typescript
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: 'readonly' | 'edit' = 'readonly';
  @Input() latitude = 7.1254;
  @Input() longitude = -73.1198;
  @Input() zoom = 13;

  @Output() coordinateSelected = new EventEmitter<{ latitude: number; longitude: number }>();

  private map!: L.Map;
  private marker!: L.Marker;
}
```

### 6. Frontend: Model Updates

**Archivo:** `experience.model.ts`

```typescript
export interface ExperienceResponse {
  // ... campos existentes ...
  latitude: number;
  longitude: number;
}

export interface ExperienceRequest {
  // ... campos existentes ...
  latitude: number;
  longitude: number;
}
```

### 7. Frontend: ExperienceDetail Integration

Se agrega el `MapComponent` en modo `readonly` al template del detalle, pasando las coordenadas de la experiencia.

### 8. Frontend: ExperienceForm Integration

Se agregan campos `latitude` y `longitude` al `FormGroup` con validadores `Validators.required`, `Validators.min(-90)`, `Validators.max(90)` para latitude y `Validators.min(-180)`, `Validators.max(180)` para longitude. Se implementa sincronización bidireccional entre los campos del formulario y el mapa.

## Interfaces

### MapComponent API

| Tipo | Nombre | Tipo de dato | Descripción |
|------|--------|-------------|-------------|
| @Input | `mode` | `'readonly' \| 'edit'` | Modo de operación del mapa |
| @Input | `latitude` | `number` | Latitud para centrar el mapa y posicionar el marcador |
| @Input | `longitude` | `number` | Longitud para centrar el mapa y posicionar el marcador |
| @Input | `zoom` | `number` | Nivel de zoom inicial (default: 13) |
| @Output | `coordinateSelected` | `EventEmitter<{latitude: number, longitude: number}>` | Evento emitido al hacer clic en modo edit |

### Backend REST API (cambios)

**POST /api/experiences** y **PUT /api/experiences/{id}**

Request body agrega:
```json
{
  "latitude": 7.1254,
  "longitude": -73.1198
}
```

**GET /api/experiences/{id}** y **GET /api/experiences**

Response body agrega:
```json
{
  "latitude": 7.1254,
  "longitude": -73.1198
}
```

**Error response (400) para coordenadas inválidas:**
```json
{
  "message": "La latitud debe ser >= -90",
  "status": 400
}
```

## Data Models

### Experience Entity (actualizada)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| latitude | Double | NOT NULL, [-90, 90] | Latitud geográfica |
| longitude | Double | NOT NULL, [-180, 180] | Longitud geográfica |

### Migración V8

| Columna | Tipo PostgreSQL | Default | Nullable |
|---------|----------------|---------|----------|
| latitude | DOUBLE PRECISION | 7.1254 | NOT NULL |
| longitude | DOUBLE PRECISION | -73.1198 | NOT NULL |

### Frontend ExperienceRequest (actualizada)

| Campo | Tipo TypeScript | Obligatorio | Validación |
|-------|----------------|-------------|------------|
| latitude | number | Sí | [-90, 90] |
| longitude | number | Sí | [-180, 180] |

### Frontend ExperienceResponse (actualizada)

| Campo | Tipo TypeScript | Descripción |
|-------|----------------|-------------|
| latitude | number | Latitud de la experiencia |
| longitude | number | Longitud de la experiencia |

## Error Handling

### Backend

| Escenario | HTTP Status | Mensaje |
|-----------|-------------|---------|
| latitude fuera de rango [-90, 90] | 400 | "La latitud debe ser >= -90" / "La latitud debe ser <= 90" |
| longitude fuera de rango [-180, 180] | 400 | "La longitud debe ser >= -180" / "La longitud debe ser <= 180" |
| latitude o longitude null en request | 400 | "La latitud es obligatoria" / "La longitud es obligatoria" |

### Frontend

| Escenario | Comportamiento |
|-----------|---------------|
| Formulario con lat/lng vacíos | Campos marcados como inválidos, submit deshabilitado |
| Leaflet no carga tiles | El contenedor del mapa se muestra vacío (graceful degradation) |
| Coordenadas inválidas desde API | Se usan Coordenadas_Santander como fallback |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Coordinate range validation

*For any* pair of values (lat, lng), the backend SHALL accept the request if and only if lat ∈ [-90.0, 90.0] AND lng ∈ [-180.0, 180.0]; otherwise it SHALL return HTTP 400 with a descriptive error message.

**Validates: Requirements 1.4, 1.5, 1.6**

### Property 2: Coordinate persistence round-trip

*For any* valid coordinate pair (lat, lng) written to an experience (via create or update), querying that experience SHALL return the same latitude and longitude values.

**Validates: Requirements 1.2, 1.3, 1.7**

### Property 3: MapComponent input positioning

*For any* valid coordinate pair passed as `latitude` and `longitude` inputs to the MapComponent, the map SHALL center on those coordinates and display a marker at that exact position, regardless of mode.

**Validates: Requirements 3.3, 3.4**

### Property 4: MapComponent edit-mode click emission

*For any* click event on the MapComponent in `edit` mode, the component SHALL emit a `coordinateSelected` event containing the clicked latitude and longitude, AND move the marker to that position.

**Validates: Requirements 3.6, 3.7, 3.8**

### Property 5: ExperienceDetail coordinate pass-through

*For any* ExperienceResponse with latitude and longitude values, the ExperienceDetail component SHALL pass those exact coordinates to the MapComponent inputs.

**Validates: Requirements 4.1, 4.2**

### Property 6: ExperienceForm bidirectional coordinate sync

*For any* coordinate change — whether originating from a map click event or from manual text input in the form fields — the other side (form fields or map marker) SHALL reflect the same coordinate values.

**Validates: Requirements 5.4, 5.6**

### Property 7: ExperienceForm coordinate required validation

*For any* form submission attempt where latitude or longitude is empty or null, the ExperienceForm SHALL mark the form as invalid and prevent submission.

**Validates: Requirements 5.1, 5.2**
