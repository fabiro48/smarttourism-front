# Plan de Implementación: Auth Module Implementation

## Overview

Implementación incremental del módulo de autenticación del frontend Angular de Smart Tourism. Se parte de los componentes placeholder existentes (`LoginComponent`, `RegisterComponent`) y se convierten en formularios reactivos completamente funcionales integrados con el backend Spring Boot. El orden de tareas garantiza que cada paso sea verificable antes de continuar.

## Tasks

- [x] 1. Extender AuthService con métodos HTTP
  - Añadir `HttpClient` mediante `inject(HttpClient)` al `AuthService` existente en `src/app/core/services/auth.service.ts`
  - Implementar `loginHttp(email: string, password: string): Observable<AuthResponse>` que realice POST a `${environment.apiUrl}/auth/login`
  - Implementar `registerHttp(name: string, email: string, password: string): Observable<AuthResponse>` que realice POST a `${environment.apiUrl}/auth/register`
  - Importar `HttpClient`, `Observable`, `environment`, `AuthResponse`, `LoginRequest`, `RegisterRequest`
  - El servicio debe propagar errores HTTP sin capturarlos (el componente los maneja)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 1.1 Escribir tests unitarios para los métodos HTTP de AuthService
    - Verificar que `loginHttp` realiza POST a la URL correcta con el cuerpo `{email, password}`
    - Verificar que `registerHttp` realiza POST a la URL correcta con el cuerpo `{name, email, password}`
    - Verificar que los errores HTTP se propagan al suscriptor
    - Usar `HttpClientTestingModule` y `HttpTestingController`
    - _Requirements: 5.3, 5.4, 5.6_

- [x] 2. Implementar LoginComponent — lógica TypeScript
  - Reemplazar el contenido de `src/app/features/auth/login/login.component.ts` con la implementación completa
  - Añadir imports: `FormBuilder`, `FormGroup`, `Validators`, `ReactiveFormsModule`, `CommonModule`, `Router`, `HttpErrorResponse`, `AuthService`
  - Definir `form: FormGroup` con controles `email` (required, email) y `password` (required, minLength(6))
  - Añadir propiedades `isLoading = false` y `errorMessage = ''`
  - Añadir getters `email` y `password` para acceso desde el template
  - Implementar `onSubmit()`: validar formulario, llamar a `authService.loginHttp()`, manejar respuesta 200 (login + navigate) y errores 401 / 5xx
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 8.1, 8.3, 8.5_

  - [ ]* 2.1 Escribir test de propiedad P2 — Invariante de formulario inválido
    - **Property 2: Si `form.invalid === true` y se invoca `onSubmit()`, no se realiza ninguna petición HTTP**
    - Verificar que `authService.loginHttp` no es invocado cuando el formulario tiene campos vacíos o inválidos
    - Verificar que `markAllAsTouched()` es llamado en ese caso
    - **Validates: Requirements 1.4, 1.5**

  - [ ]* 2.2 Escribir test de propiedad P3 — Invariante de estado de carga (Login)
    - **Property 3: `isLoading` es `true` solo durante el intervalo entre envío válido y respuesta del backend**
    - Verificar que `isLoading` es `false` antes del envío
    - Verificar que `isLoading` es `true` mientras la petición está en curso
    - Verificar que `isLoading` es `false` tras respuesta exitosa y tras error
    - Usar `HttpTestingController` para controlar el timing
    - **Validates: Requirements 1.11, 8.1, 8.3, 8.5**

  - [ ]* 2.3 Escribir tests unitarios de LoginComponent (ejemplos y casos borde)
    - Test: formulario inicializado con campos vacíos — _Requirements: 6.1_
    - Test: botón deshabilitado con campos inválidos — _Requirements: 6.2_
    - Test: botón habilitado con campos válidos — _Requirements: 6.3_
    - Test: mensajes de error visibles tras `onSubmit()` con campos inválidos — _Requirements: 6.4_
    - Test: `loginHttp` invocado con datos correctos — _Requirements: 6.5_
    - Test: `authService.login(token)` invocado tras respuesta 200 — _Requirements: 6.6_
    - Test: navegación a `/experiences` tras login exitoso — _Requirements: 6.7_
    - Test: mensaje de error visible tras respuesta 401 — _Requirements: 6.8_
    - Test: `isLoading` true durante petición — _Requirements: 6.9_

- [x] 3. Implementar LoginComponent — template HTML
  - Reemplazar el contenido de `src/app/features/auth/login/login.component.html`
  - Estructura: `div.auth-page > div.auth-card.card > h1 + form`
  - Añadir `[formGroup]="form"`, `(ngSubmit)="onSubmit()"`, `role="form"`, `novalidate`
  - Campo email: `id="login-email"`, `formControlName="email"`, `[class.is-invalid]`, `autocomplete="email"`, `aria-describedby="login-email-error"`
  - Mensajes de error email: `*ngIf` con `email.invalid && (email.touched || email.dirty)`, `role="alert"`, spans para `required` y `email`
  - Campo password: `id="login-password"`, `formControlName="password"`, `[class.is-invalid]`, `autocomplete="current-password"`, `aria-describedby="login-password-error"`
  - Mensajes de error password: spans para `required` y `minlength`
  - Bloque de error de backend: `*ngIf="errorMessage"`, `role="alert"`
  - Botón submit: `[disabled]="isLoading"`, `[attr.aria-disabled]="isLoading"`, texto dinámico con operador ternario
  - Enlace a registro: `routerLink="/auth/register"` con texto "¿No tienes cuenta? Regístrate"
  - _Requirements: 1.1, 1.4, 1.5, 1.9, 1.10, 1.11, 4.1, 4.3, 9.1, 9.3, 9.5, 9.7, 10.1, 10.3, 10.5_

- [x] 4. Implementar LoginComponent — estilos SCSS
  - Reemplazar el contenido de `src/app/features/auth/login/login.component.scss`
  - Clase `.auth-page`: flex, centrado vertical y horizontal, `min-height: calc(100vh - 120px)`, `background-color: var(--color-bg)`
  - Clase `.auth-card`: `max-width: 420px`, `padding: 2rem`
  - Clase `.auth-title`: `font-size: 1.5rem`, `font-weight: 600`, `color: var(--color-text)`, centrado
  - Clase `.form-group`: `margin-bottom: 1rem`, label con `font-size: 0.875rem`
  - Clase `.form-control`: bordes con `var(--color-border)`, `border-radius: var(--radius-control)`, focus con `var(--color-primary)`, estado `.is-invalid` con `var(--color-error)`
  - Clase `.field-error`: `color: var(--color-error)`, `font-size: 0.8rem`
  - Clase `.backend-error`: `color: var(--color-error)`, fondo semitransparente, borde con `var(--color-error)`
  - Clase `.auth-link`: centrado, enlace con `color: var(--color-primary)`
  - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9_

- [x] 5. Checkpoint — Verificar LoginComponent completo
  - Asegurar que todos los tests del LoginComponent pasan
  - Verificar que no hay errores de compilación TypeScript en los archivos modificados
  - Preguntar al usuario si tiene dudas antes de continuar con RegisterComponent

- [x] 6. Implementar RegisterComponent — lógica TypeScript
  - Reemplazar el contenido de `src/app/features/auth/register/register.component.ts` con la implementación completa
  - Añadir imports: `FormBuilder`, `FormGroup`, `Validators`, `ReactiveFormsModule`, `CommonModule`, `Router`, `HttpErrorResponse`, `AuthService`
  - Definir `form: FormGroup` con controles `name` (required, minLength(2)), `email` (required, email) y `password` (required, minLength(6))
  - Añadir propiedades `isLoading = false` y `errorMessage = ''`
  - Añadir getters `name`, `email` y `password`
  - Implementar `onSubmit()`: validar formulario, llamar a `authService.registerHttp()`, manejar respuesta 200 (login + navigate) y errores 409 / 400 / 5xx
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 8.2, 8.4, 8.6_

  - [ ]* 6.1 Escribir test de propiedad P2 — Invariante de formulario inválido (Register)
    - **Property 2: Si `form.invalid === true` y se invoca `onSubmit()`, no se realiza ninguna petición HTTP**
    - Verificar que `authService.registerHttp` no es invocado cuando el formulario tiene campos vacíos o inválidos
    - **Validates: Requirements 2.5, 2.6**

  - [ ]* 6.2 Escribir test de propiedad P3 — Invariante de estado de carga (Register)
    - **Property 3: `isLoading` es `true` solo durante el intervalo entre envío válido y respuesta del backend**
    - Verificar que `isLoading` es `false` antes del envío, `true` durante la petición y `false` tras la respuesta
    - Usar `HttpTestingController`
    - **Validates: Requirements 2.13, 8.2, 8.4, 8.6**

  - [ ]* 6.3 Escribir tests unitarios de RegisterComponent (ejemplos y casos borde)
    - Test: formulario inicializado con campos vacíos — _Requirements: 7.1_
    - Test: botón deshabilitado con campos inválidos — _Requirements: 7.2_
    - Test: botón habilitado con campos válidos — _Requirements: 7.3_
    - Test: mensajes de error visibles tras `onSubmit()` con campos inválidos — _Requirements: 7.4_
    - Test: `registerHttp` invocado con datos correctos — _Requirements: 7.5_
    - Test: `authService.login(token)` invocado tras respuesta 200 — _Requirements: 7.6_
    - Test: navegación a `/experiences` tras registro exitoso — _Requirements: 7.7_
    - Test: mensaje de error visible tras respuesta 409 — _Requirements: 7.8_
    - Test: `isLoading` true durante petición — _Requirements: 7.9_

- [x] 7. Implementar RegisterComponent — template HTML
  - Reemplazar el contenido de `src/app/features/auth/register/register.component.html`
  - Estructura idéntica a login: `div.auth-page > div.auth-card.card > h1 + form`
  - Añadir `[formGroup]="form"`, `(ngSubmit)="onSubmit()"`, `role="form"`, `novalidate`
  - Campo name: `id="register-name"`, `formControlName="name"`, `[class.is-invalid]`, `autocomplete="name"`, `aria-describedby="register-name-error"`, spans para `required` y `minlength`
  - Campo email: `id="register-email"`, `formControlName="email"`, `[class.is-invalid]`, `autocomplete="email"`, `aria-describedby="register-email-error"`, spans para `required` y `email`
  - Campo password: `id="register-password"`, `formControlName="password"`, `[class.is-invalid]`, `autocomplete="new-password"`, `aria-describedby="register-password-error"`, spans para `required` y `minlength`
  - Bloque de error de backend: `*ngIf="errorMessage"`, `role="alert"`
  - Botón submit: `[disabled]="isLoading"`, `[attr.aria-disabled]="isLoading"`, texto dinámico
  - Enlace a login: `routerLink="/auth/login"` con texto "¿Ya tienes cuenta? Inicia sesión"
  - _Requirements: 2.1, 2.5, 2.6, 2.10, 2.11, 2.12, 2.13, 4.2, 4.4, 9.2, 9.4, 9.6, 9.8, 10.2, 10.4, 10.6_

- [x] 8. Implementar RegisterComponent — estilos SCSS
  - Reemplazar el contenido de `src/app/features/auth/register/register.component.scss`
  - Aplicar las mismas clases y variables CSS que en `login.component.scss`
  - Clases: `.auth-page`, `.auth-card`, `.auth-title`, `.form-group`, `.form-control`, `.field-error`, `.backend-error`, `.auth-link`
  - Usar las mismas variables CSS del Design System: `var(--color-bg)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-primary)`, `var(--color-error)`, `var(--color-text)`, `var(--color-muted)`, `var(--radius-control)`, `var(--radius-card)`
  - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10_

- [x] 9. Escribir tests de propiedades P1, P4, P5, P6 en AuthService
  - [ ]* 9.1 Escribir test de propiedad P1 — Invariante de autenticación
    - **Property 1: Si `isAuthenticated()` retorna `true`, entonces `localStorage.getItem('auth_token')` es no nulo y no vacío**
    - Verificar el contrarrecíproco: si no hay token en localStorage, `isAuthenticated()` retorna `false`
    - **Validates: Requirements 5.5**

  - [ ]* 9.2 Escribir test de propiedad P4 — Invariante de token tras login exitoso
    - **Property 4: Si `loginHttp()` o `registerHttp()` emite `{token}`, entonces `localStorage.getItem('auth_token') === token`**
    - Verificar que `authService.login(token)` almacena exactamente el token recibido
    - **Validates: Requirements 1.7, 2.8**

  - [ ]* 9.3 Escribir test de propiedad P5 — Invariante de navegación tras autenticación
    - **Property 5: Si `AuthService.login(token)` es invocado desde un componente de auth, el router navega a `/experiences`**
    - Verificar en LoginComponent y RegisterComponent que la navegación ocurre tras respuesta 200
    - Usar spy de `Router.navigate`
    - **Validates: Requirements 1.8, 2.9**

  - [ ]* 9.4 Escribir test de propiedad P6 — Invariante de mensaje de error
    - **Property 6: Si el backend responde con error HTTP, `errorMessage` es no vacío y `isLoading` es `false`**
    - Verificar para LoginComponent: errores 401 y 5xx
    - Verificar para RegisterComponent: errores 409, 400 y 5xx
    - **Validates: Requirements 1.9, 1.10, 2.10, 2.11, 2.12**

- [x] 10. Checkpoint final — Verificar implementación completa
  - Asegurar que todos los tests pasan (AuthService, LoginComponent, RegisterComponent)
  - Verificar que no hay errores de compilación TypeScript en ningún archivo modificado
  - Verificar que los archivos modificados son exactamente los definidos en el diseño: `auth.service.ts`, `login.component.ts`, `login.component.html`, `login.component.scss`, `register.component.ts`, `register.component.html`, `register.component.scss`
  - Preguntar al usuario si tiene dudas antes de dar por completada la implementación

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints (tareas 5 y 10) garantizan validación incremental
- Los tests de propiedades validan invariantes universales del sistema de autenticación
- Los tests unitarios validan ejemplos concretos y casos borde
- No se crean nuevos servicios ni modelos: todo se integra en la estructura existente
