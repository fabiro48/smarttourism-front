# Implementation Plan: Frontend Scaffolding — Smart Tourism

## Overview

Implementación incremental del scaffolding inicial del frontend Angular para Smart Tourism. Cada tarea construye sobre la anterior, comenzando por la inicialización del proyecto y terminando con todos los módulos feature conectados y funcionales.

## Tasks

- [x] 1. Inicializar el proyecto Angular en `smarttourism-front/`
  - Crear el proyecto Angular con Angular CLI usando la última versión estable, con SCSS como preprocesador, standalone components habilitados y `strict: true` en `tsconfig.json`
  - Verificar que `ng serve` levanta en el puerto 4200 y `ng build` compila sin errores
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 2. Integrar Bootstrap y configurar el Design System global
  - [x] 2.1 Instalar Bootstrap como dependencia npm e importar sus estilos en `styles.scss` antes de cualquier estilo personalizado
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Definir las variables CSS en `:root` dentro de `styles.scss` (colores, radios) y aplicar `background-color` y `color` al `body`
    - Variables: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-success`, `--color-error`, `--color-border`, `--radius-card`, `--radius-control`
    - _Requirements: 3.1, 3.2_
  - [x] 2.3 Definir estilos base para botones (primario, secundario, outline) y cards en `styles.scss`
    - Sin gradientes, sin sombras superiores a `0 2px 8px rgba(0,0,0,0.08)`, sin fondos oscuros
    - Fuente base `font-family: 'Inter', sans-serif` con fallback al sistema
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 3. Crear la estructura de carpetas y archivos de configuración
  - [x] 3.1 Crear la estructura de directorios dentro de `src/app/`: `features/auth/`, `features/experiences/`, `features/reservations/`, `features/payments/`, `features/reviews/`, `features/admin/`, `shared/components/`, `shared/directives/`, `shared/pipes/`, `core/guards/`, `core/interceptors/`, `core/services/`, `core/models/`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 3.2 Crear los archivos de environment: `src/environments/environment.ts` con `apiUrl: 'http://localhost:8080/api'` y `src/environments/environment.prod.ts` con la URL de producción placeholder
    - Configurar el reemplazo de environment en `angular.json` para el build de producción
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 3.3 Crear el archivo `proxy.conf.json` en la raíz de `smarttourism-front/` redirigiendo `/api` a `http://localhost:8080` con `changeOrigin: true`, y referenciar el proxy en `angular.json` bajo la configuración `serve`
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 4. Implementar los modelos de dominio y el AuthService
  - [x] 4.1 Crear `src/app/core/models/user.model.ts` con las interfaces `JwtPayload`, `AuthResponse`, `LoginRequest`, `RegisterRequest` y el tipo `UserRole`
    - _Requirements: 8.1_
  - [x] 4.2 Implementar `src/app/core/services/auth.service.ts` con los métodos `login()`, `logout()`, `getToken()`, `isAuthenticated()`, `getUserRole()` y el `Subject` `logout$`
    - Usar `localStorage` con la clave `auth_token`; `getUserRole()` decodifica el payload base64url del JWT
    - `logout()` debe emitir en `logout$` y navegar a `/auth/login`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [x] 4.3 Escribir tests unitarios para AuthService
    - Cubrir: `login()` almacena token, `logout()` elimina token y emite evento, `isAuthenticated()` retorna true/false según presencia de token, `getUserRole()` decodifica correctamente el campo `role` del JWT, `getUserRole()` retorna null con token malformado
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 5. Implementar el AuthInterceptor y los Guards
  - [x] 5.1 Implementar `src/app/core/interceptors/auth.interceptor.ts` como `HttpInterceptorFn`: adjunta `Authorization: Bearer {token}` si existe token, y en respuesta 401 elimina el token y redirige a `/auth/login`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 5.2 Implementar `src/app/core/guards/auth.guard.ts` como `CanActivateFn`: retorna `true` si hay token, o `UrlTree` a `/auth/login` si no hay token
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 5.3 Implementar `src/app/core/guards/admin.guard.ts` como `CanActivateFn`: retorna `true` si el rol es `ADMIN`, o `UrlTree` a `/experiences` en caso contrario
    - _Requirements: 7.4, 7.5, 7.6_
  - [x] 5.4 Escribir tests unitarios para AuthInterceptor y Guards
    - AuthInterceptor: verifica que adjunta el header con token presente, que no lo adjunta sin token, y que redirige en 401
    - authGuard: verifica redirección a `/auth/login` sin token y paso libre con token
    - adminGuard: verifica redirección a `/experiences` sin rol ADMIN y paso libre con rol ADMIN
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 6. Configurar `app.config.ts` y el enrutamiento principal
  - [x] 6.1 Crear `src/app/app.config.ts` registrando `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))` y cualquier otro provider global necesario
    - _Requirements: 6.5_
  - [x] 6.2 Crear `src/app/app.routes.ts` con rutas lazy-loaded para cada feature (`/auth`, `/experiences`, `/reservations`, `/payments`, `/reviews`, `/admin`), redirección de `/` a `/experiences`, ruta comodín `**` a `/experiences`, y aplicar `authGuard` y `adminGuard` donde corresponda
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implementar los componentes shell (Navbar y Footer)
  - [x] 7.1 Implementar `src/app/shared/components/footer/footer.component.ts` como componente standalone con el texto "© 2025 Smart Tourism — Proyecto Universitario", usando `background-color: var(--color-surface)` y `border-top: 1px solid var(--color-border)`
    - _Requirements: 9.8, 9.9, 9.10_
  - [x] 7.2 Implementar `src/app/shared/components/navbar/navbar.component.ts` como componente standalone que inyecta `AuthService`, suscribe a `logout$` para actualizar estado, y expone `isAuthenticated` e `isAdmin`
    - Template: muestra "Smart Tourism" con `var(--color-primary)`, enlace a `/auth/login` si no autenticado, enlaces a `/experiences`, `/reservations`, `/reviews` si autenticado, enlace a `/admin` solo si `isAdmin`, botón "Cerrar sesión" que invoca `logout()`
    - Estilos: `background-color: var(--color-surface)`, `border-bottom: 1px solid var(--color-border)`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [x] 7.3 Escribir tests unitarios para NavbarComponent
    - Verificar que muestra "Iniciar sesión" cuando no autenticado, que muestra los enlaces de navegación cuando autenticado, que muestra el enlace Admin solo con rol ADMIN, y que el botón "Cerrar sesión" invoca `authService.logout()`
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

- [x] 8. Implementar el AppComponent y conectar el shell
  - Crear `src/app/app.component.ts` como componente standalone que importa `RouterOutlet`, `NavbarComponent` y `FooterComponent`
  - Template: `<app-navbar />`, `<main class="main-content"><router-outlet /></main>`, `<app-footer />`
  - Estilos del host: `display: flex; flex-direction: column; min-height: 100vh` con `main` en `flex: 1`
  - _Requirements: 5.6_

- [x] 9. Checkpoint — Verificar compilación y navegación base
  - Asegurarse de que `ng build` compila sin errores y que `ng serve` levanta correctamente
  - Verificar que la redirección de `/` a `/experiences` funciona y que el shell (Navbar + Footer) se renderiza en todas las rutas
  - Asegurarse de que todos los tests pasan; consultar al usuario si surgen dudas

- [x] 10. Crear los módulos feature con estructura base
  - [x] 10.1 Crear el módulo `features/auth/` con `auth.routes.ts` y los componentes placeholder `LoginComponent` (`/auth/login`) y `RegisterComponent` (`/auth/register`), cada uno con sus archivos `.ts`, `.html` y `.scss`
    - _Requirements: 12.1, 12.2, 12.4_
  - [x] 10.2 Crear los módulos `features/experiences/`, `features/reservations/`, `features/payments/`, `features/reviews/` y `features/admin/`, cada uno con su archivo `{feature}.routes.ts` y un componente placeholder que se renderiza en la ruta raíz del módulo
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 11. Configurar ESLint con `@angular-eslint`
  - Añadir `@angular-eslint` al proyecto mediante `ng add @angular-eslint/schematics` o configuración manual
  - Asegurar que el archivo de configuración ESLint incluye la regla `@typescript-eslint/no-explicit-any` como advertencia
  - Verificar que `ng lint` completa sin errores de configuración
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 12. Checkpoint final — Verificar integración completa
  - Ejecutar `ng build` y confirmar que no hay errores de compilación ni de tipos
  - Ejecutar `ng lint` y confirmar que no hay errores de configuración
  - Asegurarse de que todos los tests pasan; consultar al usuario si surgen dudas

## Notes

- Las sub-tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- El lenguaje de implementación es TypeScript (Angular 19+)
- Los checkpoints garantizan validación incremental antes de continuar
- El proxy (`proxy.conf.json`) solo aplica en desarrollo; en producción el backend debe configurar CORS
