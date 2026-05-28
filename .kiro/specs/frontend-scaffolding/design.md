# Design Document — Frontend Scaffolding (Smart Tourism)

## Overview

Este documento describe el diseño técnico del scaffolding inicial del frontend Angular para **Smart Tourism**, una plataforma MVP universitaria de turismo inteligente en Santander. El objetivo es establecer una base de código sólida, coherente y lista para que el equipo desarrolle cada módulo funcional de forma independiente.

### Contexto del sistema

```
┌─────────────────────────────────────────────────────────┐
│                     Navegador (Browser)                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Angular SPA (smarttourism-front)         │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────────────────────────┐  │   │
│  │  │  Navbar  │  │       RouterOutlet            │  │   │
│  │  └──────────┘  │  (Feature Modules lazy)       │  │   │
│  │  ┌──────────┐  └──────────────────────────────┘  │   │
│  │  │  Footer  │                                    │   │
│  │  └──────────┘                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                         │ HTTP /api/*                    │
│                         ▼ (proxy dev / CORS prod)        │
│  ┌──────────────────────────────────────────────────┐   │
│  │     Spring Boot Backend (localhost:8080)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Decisiones de diseño clave

| Decisión | Elección | Justificación |
|---|---|---|
| Componentes | Standalone (Angular 19+) | Elimina NgModules boilerplate; es el estándar actual de Angular |
| Estilos | SCSS global + CSS custom properties | Permite theming centralizado sin dependencia de preprocesador en componentes |
| Autenticación | JWT en localStorage | Simplicidad para MVP; el interceptor centraliza el manejo |
| Routing | Lazy loading por feature | Reduce bundle inicial; cada feature es un chunk independiente |
| HTTP | `provideHttpClient` funcional | API moderna de Angular 17+; compatible con standalone |
| Guards | `CanActivateFn` funcional | Patrón recomendado en Angular 15+; sin clases ni inyección manual |

---

## Architecture

### Diagrama de arquitectura de módulos

```
smarttourism-front/src/app/
│
├── app.component.ts          ← Shell: Navbar + RouterOutlet + Footer
├── app.routes.ts             ← Rutas raíz con lazy loading
├── app.config.ts             ← Providers: Router, HttpClient, Interceptors
│
├── core/                     ← Singleton: servicios, guards, interceptores
│   ├── guards/
│   │   ├── auth.guard.ts     ← CanActivateFn: requiere token
│   │   └── admin.guard.ts    ← CanActivateFn: requiere rol ADMIN
│   ├── interceptors/
│   │   └── auth.interceptor.ts  ← Adjunta Bearer token; maneja 401
│   ├── services/
│   │   └── auth.service.ts   ← Gestión JWT: login/logout/isAuthenticated
│   └── models/
│       └── user.model.ts     ← Interfaces TypeScript del dominio auth
│
├── shared/                   ← Componentes/directivas/pipes reutilizables
│   ├── components/
│   │   ├── navbar/
│   │   │   ├── navbar.component.ts
│   │   │   ├── navbar.component.html
│   │   │   └── navbar.component.scss
│   │   └── footer/
│   │       ├── footer.component.ts
│   │       ├── footer.component.html
│   │       └── footer.component.scss
│   ├── directives/           ← (vacío en scaffolding)
│   └── pipes/                ← (vacío en scaffolding)
│
└── features/                 ← Módulos lazy por dominio funcional
    ├── auth/
    │   ├── auth.routes.ts
    │   ├── login/
    │   │   ├── login.component.ts
    │   │   ├── login.component.html
    │   │   └── login.component.scss
    │   └── register/
    │       ├── register.component.ts
    │       ├── register.component.html
    │       └── register.component.scss
    ├── experiences/
    │   ├── experiences.routes.ts
    │   └── experiences/
    │       ├── experiences.component.ts
    │       ├── experiences.component.html
    │       └── experiences.component.scss
    ├── reservations/
    │   ├── reservations.routes.ts
    │   └── reservations/
    │       ├── reservations.component.ts
    │       ├── reservations.component.html
    │       └── reservations.component.scss
    ├── payments/
    │   ├── payments.routes.ts
    │   └── payments/
    │       ├── payments.component.ts
    │       ├── payments.component.html
    │       └── payments.component.scss
    ├── reviews/
    │   ├── reviews.routes.ts
    │   └── reviews/
    │       ├── reviews.component.ts
    │       ├── reviews.component.html
    │       └── reviews.component.scss
    └── admin/
        ├── admin.routes.ts
        └── admin/
            ├── admin.component.ts
            ├── admin.component.html
            └── admin.component.scss
```

### Flujo de una petición autenticada

```
Usuario navega a /reservations
        │
        ▼
  auth.guard.ts
  ¿localStorage['auth_token'] existe?
        │
   No ──┼──► redirect /auth/login
        │
   Sí ──┼──► carga lazy ReservationsModule
        │
        ▼
  Componente hace HTTP GET /api/reservations
        │
        ▼
  auth.interceptor.ts
  Lee localStorage['auth_token']
  Adjunta: Authorization: Bearer <token>
        │
        ▼
  proxy.conf.json (dev) redirige a localhost:8080
        │
        ▼
  Spring Boot responde
        │
  ¿401? ──► interceptor borra token → redirect /auth/login
        │
  ¿200? ──► datos al componente
```

---

## Components and Interfaces

### AppComponent

Componente raíz (shell). Renderiza la estructura persistente de la aplicación.

```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {}
```

### NavbarComponent

Componente standalone de navegación. Reacciona al estado de autenticación.

```typescript
// src/app/shared/components/navbar/navbar.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private logoutSub?: Subscription;

  isAuthenticated = false;
  isAdmin = false;

  ngOnInit(): void {
    this.updateAuthState();
    // Reacciona al evento de logout emitido por AuthService
    this.logoutSub = this.authService.logout$.subscribe(() => {
      this.updateAuthState();
    });
  }

  ngOnDestroy(): void {
    this.logoutSub?.unsubscribe();
  }

  private updateAuthState(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
```

**Template HTML del Navbar:**

```html
<!-- src/app/shared/components/navbar/navbar.component.html -->
<nav class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <!-- Brand -->
    <a class="navbar-brand" routerLink="/experiences">Smart Tourism</a>

    <!-- Toggler mobile -->
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#navbarContent"
            aria-controls="navbarContent" aria-expanded="false"
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Links -->
    <div class="collapse navbar-collapse" id="navbarContent">
      <ul class="navbar-nav ms-auto align-items-center gap-2">

        <!-- Usuario NO autenticado -->
        <ng-container *ngIf="!isAuthenticated">
          <li class="nav-item">
            <a class="nav-link" routerLink="/auth/login"
               routerLinkActive="active">Iniciar sesión</a>
          </li>
        </ng-container>

        <!-- Usuario autenticado -->
        <ng-container *ngIf="isAuthenticated">
          <li class="nav-item">
            <a class="nav-link" routerLink="/experiences"
               routerLinkActive="active">Experiencias</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/reservations"
               routerLinkActive="active">Reservas</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/reviews"
               routerLinkActive="active">Reseñas</a>
          </li>
          <!-- Solo ADMIN -->
          <li class="nav-item" *ngIf="isAdmin">
            <a class="nav-link" routerLink="/admin"
               routerLinkActive="active">Admin</a>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline btn-sm" (click)="onLogout()">
              Cerrar sesión
            </button>
          </li>
        </ng-container>

      </ul>
    </div>
  </div>
</nav>
```

### FooterComponent

Componente standalone de pie de página. Sin lógica de negocio.

```typescript
// src/app/shared/components/footer/footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {}
```

```html
<!-- src/app/shared/components/footer/footer.component.html -->
<footer class="footer">
  <div class="container-fluid text-center py-3">
    <span>© 2025 Smart Tourism — Proyecto Universitario</span>
  </div>
</footer>
```

### AuthService

Servicio singleton que centraliza toda la lógica de autenticación JWT.

```typescript
// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

/** Clave usada en localStorage para almacenar el JWT */
const TOKEN_KEY = 'auth_token';

/** Payload decodificado del JWT (campos relevantes para el frontend) */
export interface JwtPayload {
  sub: string;       // email / username
  role: string;      // 'USER' | 'ADMIN'
  exp: number;       // Unix timestamp de expiración
  iat: number;       // Unix timestamp de emisión
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  /**
   * Subject que emite cuando el usuario cierra sesión.
   * Los componentes (e.g. Navbar) se suscriben para actualizar su estado.
   */
  readonly logout$ = new Subject<void>();

  /**
   * Almacena el token JWT en localStorage.
   * @param token - JWT recibido del backend tras login exitoso.
   */
  login(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Elimina el token de localStorage, emite el evento logout$
   * y redirige al usuario a /auth/login.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.logout$.next();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Retorna el token JWT almacenado o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Retorna true si existe un token en localStorage.
   * No valida expiración (el backend rechazará tokens expirados con 401).
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Decodifica el payload del JWT y retorna el campo `role`.
   * Retorna null si no hay token o si el payload no contiene `role`.
   *
   * NOTA: No verifica la firma del JWT (eso es responsabilidad del backend).
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodePayload(token);
      return payload?.role ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Decodifica la sección payload (base64url) del JWT.
   * @internal
   */
  private decodePayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  }
}
```

### AuthInterceptor

Interceptor funcional que adjunta el Bearer token y maneja respuestas 401.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'auth_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  // Clonar la petición y adjuntar el header solo si existe token
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
```

### AuthGuard

Guard funcional que protege rutas que requieren autenticación.

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Retorna UrlTree para una redirección limpia (sin efectos secundarios)
  return router.createUrlTree(['/auth/login']);
};
```

### AdminGuard

Guard funcional que protege rutas que requieren rol ADMIN.

```typescript
// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getUserRole() === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/experiences']);
};
```

---

## Data Models

### Modelos de dominio de autenticación

```typescript
// src/app/core/models/user.model.ts

/** Roles disponibles en el sistema */
export type UserRole = 'USER' | 'ADMIN';

/** Payload decodificado del JWT (re-exportado desde auth.service para uso externo) */
export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/** Respuesta del endpoint POST /api/auth/login */
export interface AuthResponse {
  token: string;
}

/** Cuerpo de la petición de login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Cuerpo de la petición de registro */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
```

### Configuración de environments

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.smarttourism.com/api'
};
```

---
