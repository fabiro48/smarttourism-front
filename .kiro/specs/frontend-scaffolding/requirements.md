# Requirements Document

## Introduction

Este documento define los requisitos para el scaffolding inicial del frontend Angular del proyecto **Smart Tourism**, una plataforma MVP universitaria de turismo inteligente en Santander. El scaffolding establece la estructura base del proyecto, la configuración de herramientas, el sistema de diseño visual, la arquitectura de módulos lazy-loaded, la infraestructura de autenticación y los componentes shell reutilizables. El objetivo es que el equipo pueda comenzar a desarrollar cada módulo funcional de forma independiente y consistente sobre esta base.

El backend ya existe en `smarttourism-back/` (Spring Boot, Java, puerto 8080). El frontend se desarrollará en `smarttourism-front/` usando Angular (última versión estable), Bootstrap (última versión) y TypeScript.

---

## Glossary

- **Angular_CLI**: Herramienta de línea de comandos oficial de Angular para generar y gestionar proyectos.
- **App**: La aplicación Angular frontend de Smart Tourism.
- **Auth_Guard**: Guard de Angular que protege rutas que requieren autenticación.
- **Admin_Guard**: Guard de Angular que protege rutas que requieren rol de administrador.
- **Auth_Service**: Servicio Angular responsable de gestionar el estado de autenticación, tokens JWT y sesión del usuario.
- **HTTP_Interceptor**: Interceptor Angular que adjunta el token JWT a las peticiones HTTP salientes y maneja errores de autenticación.
- **Lazy_Module**: Módulo Angular cargado bajo demanda (lazy loading) al navegar a su ruta correspondiente.
- **Shell_Component**: Componente de nivel superior que define la estructura visual persistente de la App (navbar, footer, contenido principal).
- **Navbar**: Componente de navegación superior persistente de la App.
- **Footer**: Componente de pie de página persistente de la App.
- **Environment**: Archivo de configuración Angular que define variables según el entorno (desarrollo o producción).
- **Proxy_Config**: Archivo de configuración que redirige peticiones del servidor de desarrollo Angular al backend.
- **Design_System**: Conjunto de variables CSS/SCSS, reglas tipográficas y estilos de componentes que definen la identidad visual de la App.
- **Feature_Module**: Módulo Angular que agrupa componentes, servicios y rutas de una funcionalidad específica (Auth, Experiences, Reservations, Payments, Reviews, Admin, Shared).
- **JWT**: JSON Web Token, formato de token usado para autenticación entre frontend y backend.
- **Router**: Módulo de enrutamiento de Angular que gestiona la navegación entre vistas.
- **Bootstrap**: Framework CSS de componentes UI integrado en la App.

---

## Requirements

### Requirement 1: Inicialización del Proyecto Angular

**User Story:** Como desarrollador, quiero un proyecto Angular correctamente inicializado en `smarttourism-front/`, para que el equipo tenga una base de código funcional desde el primer día.

#### Acceptance Criteria

1. THE App SHALL estar inicializada con Angular CLI en la carpeta `smarttourism-front/` usando la última versión estable de Angular disponible.
2. THE App SHALL usar TypeScript como lenguaje principal con configuración estricta habilitada (`strict: true` en `tsconfig.json`).
3. THE App SHALL usar SCSS como preprocesador de estilos en todos los componentes generados.
4. THE App SHALL tener habilitado el soporte para standalone components como opción por defecto del proyecto.
5. WHEN el comando `ng serve` es ejecutado en `smarttourism-front/`, THE App SHALL iniciar sin errores en el puerto 4200.
6. WHEN el comando `ng build` es ejecutado en `smarttourism-front/`, THE App SHALL compilar sin errores y generar artefactos en `dist/`.

---

### Requirement 2: Integración de Bootstrap

**User Story:** Como desarrollador, quiero Bootstrap integrado en el proyecto Angular, para que los componentes UI puedan usar el sistema de grilla y utilidades de Bootstrap sin configuración adicional.

#### Acceptance Criteria

1. THE App SHALL tener Bootstrap (última versión estable) instalado como dependencia npm en `package.json`.
2. THE App SHALL importar los estilos CSS de Bootstrap en el archivo `styles.scss` global antes de cualquier estilo personalizado.
3. THE App SHALL tener disponibles las clases de Bootstrap (grid, utilities, componentes) en todos los templates HTML de la aplicación.
4. IF Bootstrap no está correctamente importado, THEN THE App SHALL mostrar un error de compilación que identifique el archivo de estilos faltante.

---

### Requirement 3: Sistema de Diseño Visual (Design System)

**User Story:** Como diseñador y desarrollador, quiero variables CSS/SCSS globales con la paleta de colores oficial de Smart Tourism, para que todos los componentes usen colores y estilos consistentes.

#### Acceptance Criteria

1. THE Design_System SHALL definir las siguientes variables CSS en el selector `:root` del archivo `styles.scss`:
   - `--color-bg: #F7F8F5`
   - `--color-surface: #FFFFFF`
   - `--color-text: #1F2A24`
   - `--color-muted: #526058`
   - `--color-primary: #1F7A5A`
   - `--color-secondary: #2563EB`
   - `--color-accent: #F59E0B`
   - `--color-success: #16A34A`
   - `--color-error: #DC2626`
   - `--color-border: #D8DED7`
   - `--radius-card: 8px`
   - `--radius-control: 8px`
2. THE Design_System SHALL aplicar `background-color: var(--color-bg)` y `color: var(--color-text)` al elemento `body` en `styles.scss`.
3. THE Design_System SHALL definir estilos base para tres variantes de botón en `styles.scss`:
   - Botón primario: fondo `var(--color-primary)`, texto blanco, `border-radius: var(--radius-control)`.
   - Botón secundario: fondo `var(--color-secondary)`, texto blanco, `border-radius: var(--radius-control)`.
   - Botón outline: fondo transparente, borde `1px solid var(--color-border)`, texto `var(--color-primary)`, `border-radius: var(--radius-control)`.
4. THE Design_System SHALL definir un estilo base para cards con `background: var(--color-surface)`, `border: 1px solid var(--color-border)` y `border-radius: var(--radius-card)`.
5. THE Design_System SHALL NO usar gradientes de fondo, sombras de caja superiores a `0 2px 8px rgba(0,0,0,0.08)`, ni fondos oscuros en los estilos globales.
6. THE Design_System SHALL definir la fuente base del cuerpo con `font-family: 'Inter', sans-serif` o la fuente del sistema como fallback.

---

### Requirement 4: Estructura de Carpetas por Feature

**User Story:** Como desarrollador, quiero una estructura de carpetas organizada por módulos/features, para que el código de cada funcionalidad esté aislado y sea fácil de localizar.

#### Acceptance Criteria

1. THE App SHALL tener la siguiente estructura de directorios dentro de `src/app/`:
   - `features/auth/` — módulo de autenticación
   - `features/experiences/` — módulo de catálogo de experiencias
   - `features/reservations/` — módulo de reservas
   - `features/payments/` — módulo de pagos simulados
   - `features/reviews/` — módulo de reseñas
   - `features/admin/` — módulo de panel de administración
   - `shared/` — componentes, directivas y pipes compartidos
   - `core/` — servicios singleton, guards, interceptores y modelos globales
2. THE App SHALL tener dentro de `core/` los subdirectorios: `guards/`, `interceptors/`, `services/`, `models/`.
3. THE App SHALL tener dentro de `shared/` los subdirectorios: `components/`, `directives/`, `pipes/`.
4. WHEN un nuevo componente es generado con Angular CLI para un feature, THE App SHALL ubicarlo dentro del directorio `features/{feature-name}/` correspondiente.

---

### Requirement 5: Enrutamiento Principal con Lazy Loading

**User Story:** Como desarrollador, quiero un sistema de routing principal con módulos lazy-loaded por feature, para que la App cargue solo el código necesario en cada navegación y mejore el tiempo de carga inicial.

#### Acceptance Criteria

1. THE Router SHALL definir rutas lazy-loaded para cada Feature_Module en el archivo de rutas principal (`app.routes.ts`):
   - `/auth` → carga lazy del módulo `features/auth`
   - `/experiences` → carga lazy del módulo `features/experiences`
   - `/reservations` → carga lazy del módulo `features/reservations`
   - `/payments` → carga lazy del módulo `features/payments`
   - `/reviews` → carga lazy del módulo `features/reviews`
   - `/admin` → carga lazy del módulo `features/admin`
2. THE Router SHALL redirigir la ruta raíz `/` a `/experiences` como ruta por defecto.
3. THE Router SHALL definir una ruta comodín `**` que redirija a `/experiences` para URLs no encontradas.
4. WHEN un usuario navega a una ruta protegida sin estar autenticado, THE Auth_Guard SHALL redirigir al usuario a `/auth/login`.
5. WHEN un usuario autenticado sin rol de administrador navega a `/admin`, THE Admin_Guard SHALL redirigir al usuario a `/experiences`.
6. THE Router SHALL usar `RouterOutlet` en el componente raíz para renderizar el contenido de cada ruta.

---

### Requirement 6: Interceptor HTTP para JWT

**User Story:** Como desarrollador, quiero un interceptor HTTP base que adjunte el token JWT a las peticiones al backend, para que las llamadas autenticadas funcionen sin repetir lógica en cada servicio.

#### Acceptance Criteria

1. THE HTTP_Interceptor SHALL leer el token JWT almacenado en `localStorage` bajo la clave `auth_token` antes de cada petición HTTP saliente.
2. WHEN el token JWT está presente en `localStorage`, THE HTTP_Interceptor SHALL adjuntar el header `Authorization: Bearer {token}` a la petición HTTP.
3. WHEN el token JWT no está presente en `localStorage`, THE HTTP_Interceptor SHALL dejar pasar la petición sin modificar el header `Authorization`.
4. WHEN el backend responde con código HTTP 401, THE HTTP_Interceptor SHALL eliminar el token de `localStorage` y redirigir al usuario a `/auth/login`.
5. THE HTTP_Interceptor SHALL estar registrado como provider funcional en `app.config.ts` usando `provideHttpClient(withInterceptors([...]))`.

---

### Requirement 7: Guards de Autenticación

**User Story:** Como desarrollador, quiero guards de autenticación y de rol de administrador, para que las rutas protegidas sean inaccesibles a usuarios no autorizados.

#### Acceptance Criteria

1. THE Auth_Guard SHALL implementarse como un guard funcional (`CanActivateFn`) en `core/guards/auth.guard.ts`.
2. WHEN el Auth_Guard evalúa una ruta y el token JWT no está presente en `localStorage`, THE Auth_Guard SHALL retornar un `UrlTree` que redirija a `/auth/login`.
3. WHEN el Auth_Guard evalúa una ruta y el token JWT está presente en `localStorage`, THE Auth_Guard SHALL retornar `true` para permitir la navegación.
4. THE Admin_Guard SHALL implementarse como un guard funcional (`CanActivateFn`) en `core/guards/admin.guard.ts`.
5. WHEN el Admin_Guard evalúa una ruta y el usuario autenticado tiene rol `ADMIN`, THE Admin_Guard SHALL retornar `true` para permitir la navegación.
6. WHEN el Admin_Guard evalúa una ruta y el usuario autenticado no tiene rol `ADMIN`, THE Admin_Guard SHALL retornar un `UrlTree` que redirija a `/experiences`.

---

### Requirement 8: Servicio de Autenticación Base

**User Story:** Como desarrollador, quiero un servicio de autenticación base que gestione el token JWT y el estado de sesión, para que los guards, interceptores y componentes puedan consultar el estado de autenticación de forma centralizada.

#### Acceptance Criteria

1. THE Auth_Service SHALL implementarse como un servicio inyectable en `core/services/auth.service.ts` con `providedIn: 'root'`.
2. THE Auth_Service SHALL exponer un método `login(token: string): void` que almacene el token JWT en `localStorage` bajo la clave `auth_token`.
3. THE Auth_Service SHALL exponer un método `logout(): void` que elimine el token JWT de `localStorage` y navegue a `/auth/login`.
4. THE Auth_Service SHALL exponer un método `getToken(): string | null` que retorne el token JWT almacenado en `localStorage` o `null` si no existe.
5. THE Auth_Service SHALL exponer un método `isAuthenticated(): boolean` que retorne `true` si existe un token en `localStorage` y `false` en caso contrario.
6. THE Auth_Service SHALL exponer un método `getUserRole(): string | null` que decodifique el payload del JWT almacenado y retorne el valor del campo `role`, o `null` si el token no existe o no contiene el campo.
7. WHEN el método `logout()` es invocado, THE Auth_Service SHALL emitir un evento a través de un `Subject` observable para que los componentes suscritos puedan reaccionar al cierre de sesión.

---

### Requirement 9: Componentes Shell (Navbar y Footer)

**User Story:** Como usuario, quiero una barra de navegación y un pie de página consistentes en todas las páginas de la App, para que la experiencia de navegación sea coherente y predecible.

#### Acceptance Criteria

1. THE Navbar SHALL implementarse como un componente standalone en `shared/components/navbar/`.
2. THE Navbar SHALL mostrar el logotipo o nombre "Smart Tourism" en el lado izquierdo con color `var(--color-primary)`.
3. WHEN el usuario no está autenticado, THE Navbar SHALL mostrar un enlace de navegación a `/auth/login` con el texto "Iniciar sesión".
4. WHEN el usuario está autenticado, THE Navbar SHALL mostrar enlaces de navegación a `/experiences`, `/reservations` y `/reviews`.
5. WHEN el usuario autenticado tiene rol `ADMIN`, THE Navbar SHALL mostrar adicionalmente un enlace de navegación a `/admin`.
6. WHEN el usuario autenticado hace clic en el botón "Cerrar sesión" del Navbar, THE Navbar SHALL invocar el método `logout()` del Auth_Service.
7. THE Navbar SHALL usar `background-color: var(--color-surface)` y `border-bottom: 1px solid var(--color-border)` como estilos base.
8. THE Footer SHALL implementarse como un componente standalone en `shared/components/footer/`.
9. THE Footer SHALL mostrar el texto "© 2025 Smart Tourism — Proyecto Universitario" con color `var(--color-muted)`.
10. THE Footer SHALL usar `background-color: var(--color-surface)` y `border-top: 1px solid var(--color-border)` como estilos base.

---

### Requirement 10: Configuración de Environments

**User Story:** Como desarrollador, quiero archivos de environment configurados para desarrollo y producción, para que las URLs del backend y otras variables de configuración se gestionen de forma centralizada y no estén hardcodeadas en los servicios.

#### Acceptance Criteria

1. THE App SHALL tener un archivo `src/environments/environment.ts` con la variable `apiUrl: 'http://localhost:8080/api'` para el entorno de desarrollo.
2. THE App SHALL tener un archivo `src/environments/environment.prod.ts` con la variable `apiUrl` apuntando a la URL de producción del backend (valor placeholder: `'https://api.smarttourism.com/api'`).
3. THE App SHALL tener configurado en `angular.json` el reemplazo de `environment.ts` por `environment.prod.ts` durante el build de producción (`ng build --configuration production`).
4. WHEN un servicio Angular necesita la URL base del backend, THE App SHALL obtenerla importando la constante `environment.apiUrl` en lugar de usar una cadena de texto literal.

---

### Requirement 11: Configuración de Proxy para el Backend

**User Story:** Como desarrollador, quiero una configuración de proxy en el servidor de desarrollo Angular, para que las peticiones al backend en `localhost:8080` funcionen sin problemas de CORS durante el desarrollo local.

#### Acceptance Criteria

1. THE App SHALL tener un archivo `proxy.conf.json` en la raíz de `smarttourism-front/` que redirija las peticiones con prefijo `/api` al backend en `http://localhost:8080`.
2. THE Proxy_Config SHALL configurar `changeOrigin: true` para evitar problemas de CORS en desarrollo.
3. THE App SHALL referenciar el archivo `proxy.conf.json` en la configuración `serve` de `angular.json` mediante la propiedad `proxyConfig`.
4. WHEN el servidor de desarrollo Angular está activo y se realiza una petición a `/api/experiences`, THE Proxy_Config SHALL redirigir la petición a `http://localhost:8080/api/experiences` de forma transparente.

---

### Requirement 12: Módulos Feature con Estructura Base

**User Story:** Como desarrollador, quiero que cada Feature_Module tenga una estructura base generada (rutas, componente principal), para que el equipo pueda comenzar a implementar cada módulo sin necesidad de configuración adicional.

#### Acceptance Criteria

1. THE App SHALL tener un archivo de rutas (`{feature}.routes.ts`) dentro de cada directorio `features/{feature}/` para los módulos: auth, experiences, reservations, payments, reviews y admin.
2. THE App SHALL tener al menos un componente placeholder en cada Feature_Module que sea renderizado en la ruta raíz del módulo (e.g., `ExperiencesComponent` en `/experiences`).
3. WHEN el Router carga un Feature_Module de forma lazy, THE App SHALL renderizar el componente placeholder del módulo sin errores en la consola del navegador.
4. THE App SHALL tener el módulo `features/auth/` con rutas base para `/auth/login` y `/auth/register`, cada una con su componente placeholder correspondiente.

---

### Requirement 13: Configuración de Linting y Formato de Código

**User Story:** Como desarrollador, quiero ESLint configurado en el proyecto Angular, para que el equipo mantenga un estilo de código consistente desde el inicio.

#### Acceptance Criteria

1. THE App SHALL tener ESLint configurado con el esquema `@angular-eslint` mediante el archivo `.eslintrc.json` o `eslint.config.js` en la raíz de `smarttourism-front/`.
2. WHEN el comando `ng lint` es ejecutado en `smarttourism-front/`, THE App SHALL completar el análisis sin errores de configuración.
3. THE App SHALL tener configuradas las reglas de TypeScript estrictas en la configuración de ESLint, incluyendo `@typescript-eslint/no-explicit-any` como advertencia.
