# Design Document — Auth Module Implementation (Smart Tourism)

## Overview

Este documento describe el diseño técnico para la implementación funcional del **Módulo de Autenticación** del frontend Angular de Smart Tourism. Los componentes placeholder `LoginComponent` y `RegisterComponent` ya existen; esta implementación los convierte en formularios reactivos completamente funcionales integrados con el backend Spring Boot.

### Decisiones de diseño clave

| Decisión | Elección | Justificación |
|---|---|---|
| Formularios | Reactive Forms (`FormGroup` / `FormControl`) | Validación programática, fácil de testear, control total del estado |
| HTTP en AuthService | Añadir `loginHttp()` / `registerHttp()` al servicio existente | Centraliza toda la lógica de auth en un único servicio; evita crear un servicio duplicado |
| Manejo de errores | `catchError` en el componente con `HttpErrorResponse` | El componente decide qué mensaje mostrar según el código HTTP |
| Estado de carga | Propiedad `isLoading: boolean` en el componente | Simple y suficiente para MVP; sin necesidad de NgRx |
| Validación en tiempo real | `touched || dirty` para mostrar errores | Evita mostrar errores antes de que el usuario interactúe con el campo |
| Estilos | SCSS del componente + variables CSS globales | Coherente con el design system; sin clases Bootstrap adicionales en lógica |

---

## Architecture

### Flujo de Login

```
Usuario rellena email + password
        │
        ▼
LoginComponent.onSubmit()
  ¿form.invalid?
   Sí ──► markAllAsTouched() → mostrar errores de validación
        │
   No ──► isLoading = true
        │
        ▼
AuthService.loginHttp(email, password)
  POST /api/auth/login
        │
   200 ──► authService.login(token)
           router.navigate(['/experiences'])
        │
   401 ──► errorMessage = 'Email o contraseña incorrectos'
           isLoading = false
        │
   5xx / red ──► errorMessage = 'Error de conexión. Intenta de nuevo más tarde'
                 isLoading = false
```

### Flujo de Registro

```
Usuario rellena name + email + password
        │
        ▼
RegisterComponent.onSubmit()
  ¿form.invalid?
   Sí ──► markAllAsTouched() → mostrar errores de validación
        │
   No ──► isLoading = true
        │
        ▼
AuthService.registerHttp(name, email, password)
  POST /api/auth/register
        │
   200 ──► authService.login(token)
           router.navigate(['/experiences'])
        │
   409 ──► errorMessage = 'Este email ya está registrado'
           isLoading = false
        │
   400 ──► errorMessage = 'Datos inválidos. Verifica los campos'
           isLoading = false
        │
   5xx / red ──► errorMessage = 'Error de conexión. Intenta de nuevo más tarde'
                 isLoading = false
```

### Estructura de archivos modificados / creados

```
smarttourism-front/src/app/
│
├── core/
│   └── services/
│       └── auth.service.ts          ← MODIFICAR: añadir loginHttp() y registerHttp()
│
└── features/
    └── auth/
        ├── login/
        │   ├── login.component.ts   ← MODIFICAR: formulario reactivo completo
        │   ├── login.component.html ← MODIFICAR: template con form, validaciones, errores
        │   └── login.component.scss ← MODIFICAR: estilos de layout centrado
        └── register/
            ├── register.component.ts   ← MODIFICAR: formulario reactivo completo
            ├── register.component.html ← MODIFICAR: template con form, validaciones, errores
            └── register.component.scss ← MODIFICAR: estilos de layout centrado
```

---

## Components and Interfaces

### AuthService — métodos HTTP añadidos

Se añaden dos métodos al `AuthService` existente. No se crea un servicio separado para mantener la cohesión.

```typescript
// Añadir a src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

// Dentro de la clase AuthService:
private http = inject(HttpClient);

/**
 * Realiza la petición de login al backend.
 * El componente es responsable de llamar a this.login(token) con la respuesta.
 */
loginHttp(email: string, password: string): Observable<AuthResponse> {
  const body: LoginRequest = { email, password };
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, body);
}

/**
 * Realiza la petición de registro al backend.
 * El componente es responsable de llamar a this.login(token) con la respuesta.
 */
registerHttp(name: string, email: string, password: string): Observable<AuthResponse> {
  const body: RegisterRequest = { name, email, password };
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, body);
}
```

### LoginComponent

```typescript
// src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.authService.loginHttp(email, password).subscribe({
      next: (res) => {
        this.authService.login(res.token);
        this.router.navigate(['/experiences']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Email o contraseña incorrectos';
        } else {
          this.errorMessage = 'Error de conexión. Intenta de nuevo más tarde';
        }
      }
    });
  }
}
```

**Template HTML del LoginComponent:**

```html
<!-- src/app/features/auth/login/login.component.html -->
<div class="auth-page">
  <div class="auth-card card">
    <h1 class="auth-title">Iniciar sesión</h1>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" role="form" novalidate>

      <!-- Email -->
      <div class="form-group">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          formControlName="email"
          class="form-control"
          [class.is-invalid]="email.invalid && (email.touched || email.dirty)"
          autocomplete="email"
          aria-describedby="login-email-error"
        />
        <div
          id="login-email-error"
          class="field-error"
          *ngIf="email.invalid && (email.touched || email.dirty)"
          role="alert"
        >
          <span *ngIf="email.errors?.['required']">El email es requerido</span>
          <span *ngIf="email.errors?.['email']">Ingresa un email válido</span>
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          formControlName="password"
          class="form-control"
          [class.is-invalid]="password.invalid && (password.touched || password.dirty)"
          autocomplete="current-password"
          aria-describedby="login-password-error"
        />
        <div
          id="login-password-error"
          class="field-error"
          *ngIf="password.invalid && (password.touched || password.dirty)"
          role="alert"
        >
          <span *ngIf="password.errors?.['required']">La contraseña es requerida</span>
          <span *ngIf="password.errors?.['minlength']">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Error de backend -->
      <div class="backend-error" *ngIf="errorMessage" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        [disabled]="isLoading"
        [attr.aria-disabled]="isLoading"
      >
        {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
      </button>

    </form>

    <p class="auth-link">
      ¿No tienes cuenta?
      <a routerLink="/auth/register">Regístrate</a>
    </p>
  </div>
</div>
```

**Estilos SCSS del LoginComponent:**

```scss
// src/app/features/auth/login/login.component.scss
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 2rem 1rem;
  background-color: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.375rem;
  }

  .form-control {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
    font-size: 1rem;
    color: var(--color-text);
    background-color: var(--color-surface);
    transition: border-color 0.15s;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(31, 122, 90, 0.15);
    }

    &.is-invalid {
      border-color: var(--color-error);
    }
  }
}

.field-error {
  font-size: 0.8rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.backend-error {
  font-size: 0.875rem;
  color: var(--color-error);
  background-color: rgba(220, 38, 38, 0.08);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-control);
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.auth-link {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

### RegisterComponent

```typescript
// src/app/features/auth/register/register.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  get name() { return this.form.get('name')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.form.value;

    this.authService.registerHttp(name, email, password).subscribe({
      next: (res) => {
        this.authService.login(res.token);
        this.router.navigate(['/experiences']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Este email ya está registrado';
        } else if (err.status === 400) {
          this.errorMessage = 'Datos inválidos. Verifica los campos';
        } else {
          this.errorMessage = 'Error de conexión. Intenta de nuevo más tarde';
        }
      }
    });
  }
}
```

**Template HTML del RegisterComponent:**

```html
<!-- src/app/features/auth/register/register.component.html -->
<div class="auth-page">
  <div class="auth-card card">
    <h1 class="auth-title">Crear cuenta</h1>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" role="form" novalidate>

      <!-- Name -->
      <div class="form-group">
        <label for="register-name">Nombre</label>
        <input
          id="register-name"
          type="text"
          formControlName="name"
          class="form-control"
          [class.is-invalid]="name.invalid && (name.touched || name.dirty)"
          autocomplete="name"
          aria-describedby="register-name-error"
        />
        <div
          id="register-name-error"
          class="field-error"
          *ngIf="name.invalid && (name.touched || name.dirty)"
          role="alert"
        >
          <span *ngIf="name.errors?.['required']">El nombre es requerido</span>
          <span *ngIf="name.errors?.['minlength']">Mínimo 2 caracteres</span>
        </div>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          formControlName="email"
          class="form-control"
          [class.is-invalid]="email.invalid && (email.touched || email.dirty)"
          autocomplete="email"
          aria-describedby="register-email-error"
        />
        <div
          id="register-email-error"
          class="field-error"
          *ngIf="email.invalid && (email.touched || email.dirty)"
          role="alert"
        >
          <span *ngIf="email.errors?.['required']">El email es requerido</span>
          <span *ngIf="email.errors?.['email']">Ingresa un email válido</span>
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          formControlName="password"
          class="form-control"
          [class.is-invalid]="password.invalid && (password.touched || password.dirty)"
          autocomplete="new-password"
          aria-describedby="register-password-error"
        />
        <div
          id="register-password-error"
          class="field-error"
          *ngIf="password.invalid && (password.touched || password.dirty)"
          role="alert"
        >
          <span *ngIf="password.errors?.['required']">La contraseña es requerida</span>
          <span *ngIf="password.errors?.['minlength']">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Error de backend -->
      <div class="backend-error" *ngIf="errorMessage" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        [disabled]="isLoading"
        [attr.aria-disabled]="isLoading"
      >
        {{ isLoading ? 'Registrando...' : 'Registrarse' }}
      </button>

    </form>

    <p class="auth-link">
      ¿Ya tienes cuenta?
      <a routerLink="/auth/login">Inicia sesión</a>
    </p>
  </div>
</div>
```

**Estilos SCSS del RegisterComponent** — idénticos a `login.component.scss` (misma clase `.auth-page`, `.auth-card`, etc.).

---

## Data Models

Los modelos ya existen en `src/app/core/models/user.model.ts` y no requieren cambios:

```typescript
export interface AuthResponse { token: string; }
export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export type UserRole = 'USER' | 'ADMIN';
```

---

## Correctness Properties

Las siguientes propiedades formales deben mantenerse en todo momento:

### P1 — Invariante de autenticación
> Si `AuthService.isAuthenticated()` retorna `true`, entonces `localStorage.getItem('auth_token')` es una cadena no nula y no vacía.

### P2 — Invariante de formulario inválido
> Si `form.invalid === true` y se invoca `onSubmit()`, entonces no se realiza ninguna petición HTTP al backend.

### P3 — Invariante de estado de carga
> `isLoading` es `true` únicamente durante el intervalo `[onSubmit() llamado con form válido, respuesta del backend recibida]`. Fuera de ese intervalo, `isLoading` es `false`.

### P4 — Invariante de token tras login exitoso
> Si `loginHttp()` o `registerHttp()` emite un valor `{token}`, entonces inmediatamente después `localStorage.getItem('auth_token') === token`.

### P5 — Invariante de navegación tras autenticación
> Si `AuthService.login(token)` es invocado desde un componente de auth, el router navega a `/experiences` en el mismo ciclo de ejecución.

### P6 — Invariante de mensaje de error
> Si el backend responde con un error HTTP, `errorMessage` es una cadena no vacía y `isLoading` es `false`.

---

## Property-Based Testing Strategy

Los tests unitarios de los componentes verificarán las propiedades anteriores usando `HttpClientTestingModule` y spies de Jasmine/Jest:

| Propiedad | Test | Herramienta |
|---|---|---|
| P1 | `isAuthenticated()` retorna true solo con token en localStorage | Jasmine spy |
| P2 | `onSubmit()` con form inválido no llama a `loginHttp` / `registerHttp` | Jasmine spy |
| P3 | `isLoading` es true durante petición y false tras respuesta | `HttpTestingController` |
| P4 | `login(token)` almacena token en localStorage | `localStorage` spy |
| P5 | Navegación a `/experiences` tras respuesta 200 | `Router` spy |
| P6 | `errorMessage` no vacío y `isLoading` false tras error HTTP | `HttpTestingController` |
