# Requirements Document

## Introduction

Este documento define los requisitos para la implementación funcional del **Módulo de Autenticación (Login y Registro)** del frontend Angular de Smart Tourism. El módulo permitirá a los usuarios iniciar sesión y registrarse en la plataforma mediante formularios reactivos que se comunican con el backend Spring Boot existente.

El scaffolding base del frontend ya está implementado, incluyendo AuthService, AuthInterceptor, Guards y componentes placeholder. Esta implementación se enfoca en hacer funcionales los formularios de login y registro, integrándolos con el backend, manejando validaciones y errores, y proporcionando una experiencia de usuario coherente con el design system establecido.

**Backend existente:**
- POST `/api/auth/login` — recibe `{email, password}`, retorna `{token: string}`
- POST `/api/auth/register` — recibe `{name, email, password}`, retorna `{token: string}`

**Frontend existente:**
- AuthService con métodos `login(token)`, `logout()`, `isAuthenticated()`, `getUserRole()`
- AuthInterceptor que adjunta JWT a peticiones HTTP
- Guards: `auth.guard.ts`, `admin.guard.ts`
- Componentes placeholder: `LoginComponent`, `RegisterComponent`
- Design system con variables CSS y estilos de botones/cards

---

## Glossary

- **Login_Form**: Formulario reactivo de Angular para inicio de sesión con campos email y password.
- **Register_Form**: Formulario reactivo de Angular para registro de usuario con campos name, email y password.
- **Auth_Service**: Servicio Angular existente que gestiona el token JWT y el estado de autenticación.
- **Backend_API**: API REST del backend Spring Boot en `http://localhost:8080/api`.
- **JWT**: JSON Web Token retornado por el backend tras autenticación exitosa.
- **Validation_Error**: Error de validación del lado del cliente (campo requerido, formato inválido, longitud mínima).
- **Backend_Error**: Error retornado por el Backend_API (credenciales incorrectas, email duplicado, servidor no disponible).
- **Router**: Servicio de enrutamiento de Angular para navegación programática.
- **Design_System**: Sistema de diseño establecido con variables CSS y estilos de componentes.
- **HttpClient**: Servicio de Angular para realizar peticiones HTTP al Backend_API.
- **ReactiveFormsModule**: Módulo de Angular que proporciona FormGroup, FormControl y Validators para formularios reactivos.

---

## Requirements

### Requirement 1: Formulario de Login Funcional

**User Story:** Como usuario, quiero iniciar sesión con mi email y contraseña, para que pueda acceder a las funcionalidades protegidas de la plataforma.

#### Acceptance Criteria

1. THE Login_Form SHALL contener dos campos de entrada: email (tipo email) y password (tipo password).
2. THE Login_Form SHALL validar que el campo email sea requerido y tenga formato de email válido.
3. THE Login_Form SHALL validar que el campo password sea requerido y tenga al menos 6 caracteres.
4. WHEN el usuario intenta enviar el Login_Form con campos inválidos, THE Login_Form SHALL mostrar mensajes de error específicos debajo de cada campo inválido.
5. WHEN el usuario intenta enviar el Login_Form con campos inválidos, THE Login_Form SHALL deshabilitar el botón de envío.
6. WHEN el usuario envía el Login_Form con datos válidos, THE Login_Form SHALL realizar una petición POST a `/api/auth/login` con el cuerpo `{email, password}`.
7. WHEN el Backend_API responde con código 200 y un token JWT, THE Login_Form SHALL invocar `AuthService.login(token)` para almacenar el token.
8. WHEN el token JWT es almacenado exitosamente, THE Router SHALL navegar al usuario a `/experiences`.
9. WHEN el Backend_API responde con código 401 (credenciales incorrectas), THE Login_Form SHALL mostrar un mensaje de error "Email o contraseña incorrectos" visible para el usuario.
10. WHEN el Backend_API responde con código 500 o error de red, THE Login_Form SHALL mostrar un mensaje de error "Error de conexión. Intenta de nuevo más tarde".
11. WHILE el Login_Form está enviando la petición al Backend_API, THE Login_Form SHALL mostrar un indicador de carga y deshabilitar el botón de envío.

---

### Requirement 2: Formulario de Registro Funcional

**User Story:** Como usuario nuevo, quiero registrarme con mi nombre, email y contraseña, para que pueda crear una cuenta y acceder a la plataforma.

#### Acceptance Criteria

1. THE Register_Form SHALL contener tres campos de entrada: name (tipo text), email (tipo email) y password (tipo password).
2. THE Register_Form SHALL validar que el campo name sea requerido y tenga al menos 2 caracteres.
3. THE Register_Form SHALL validar que el campo email sea requerido y tenga formato de email válido.
4. THE Register_Form SHALL validar que el campo password sea requerido y tenga al menos 6 caracteres.
5. WHEN el usuario intenta enviar el Register_Form con campos inválidos, THE Register_Form SHALL mostrar mensajes de error específicos debajo de cada campo inválido.
6. WHEN el usuario intenta enviar el Register_Form con campos inválidos, THE Register_Form SHALL deshabilitar el botón de envío.
7. WHEN el usuario envía el Register_Form con datos válidos, THE Register_Form SHALL realizar una petición POST a `/api/auth/register` con el cuerpo `{name, email, password}`.
8. WHEN el Backend_API responde con código 200 y un token JWT, THE Register_Form SHALL invocar `AuthService.login(token)` para almacenar el token.
9. WHEN el token JWT es almacenado exitosamente, THE Router SHALL navegar al usuario a `/experiences`.
10. WHEN el Backend_API responde con código 409 (email duplicado), THE Register_Form SHALL mostrar un mensaje de error "Este email ya está registrado" visible para el usuario.
11. WHEN el Backend_API responde con código 400 (datos inválidos), THE Register_Form SHALL mostrar un mensaje de error "Datos inválidos. Verifica los campos".
12. WHEN el Backend_API responde con código 500 o error de red, THE Register_Form SHALL mostrar un mensaje de error "Error de conexión. Intenta de nuevo más tarde".
13. WHILE el Register_Form está enviando la petición al Backend_API, THE Register_Form SHALL mostrar un indicador de carga y deshabilitar el botón de envío.

---

### Requirement 3: Integración con Design System

**User Story:** Como desarrollador, quiero que los formularios de login y registro usen el design system establecido, para que la experiencia visual sea coherente con el resto de la aplicación.

#### Acceptance Criteria

1. THE Login_Form SHALL usar las variables CSS del Design_System para colores de fondo, texto, bordes y botones.
2. THE Register_Form SHALL usar las variables CSS del Design_System para colores de fondo, texto, bordes y botones.
3. THE Login_Form SHALL renderizar el botón de envío con la clase de botón primario del Design_System (`background: var(--color-primary)`, `border-radius: var(--radius-control)`).
4. THE Register_Form SHALL renderizar el botón de envío con la clase de botón primario del Design_System (`background: var(--color-primary)`, `border-radius: var(--radius-control)`).
5. THE Login_Form SHALL renderizar el contenedor del formulario con la clase de card del Design_System (`background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-card)`).
6. THE Register_Form SHALL renderizar el contenedor del formulario con la clase de card del Design_System (`background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-card)`).
7. WHEN un campo del Login_Form tiene un Validation_Error, THE Login_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.
8. WHEN un campo del Register_Form tiene un Validation_Error, THE Register_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.
9. WHEN el Backend_API retorna un Backend_Error, THE Login_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.
10. WHEN el Backend_API retorna un Backend_Error, THE Register_Form SHALL mostrar el mensaje de error con color `var(--color-error)`.

---

### Requirement 4: Navegación entre Login y Registro

**User Story:** Como usuario, quiero poder navegar fácilmente entre las páginas de login y registro, para que pueda cambiar entre iniciar sesión y crear una cuenta sin salir del flujo de autenticación.

#### Acceptance Criteria

1. THE Login_Form SHALL mostrar un enlace de texto "¿No tienes cuenta? Regístrate" que navegue a `/auth/register`.
2. THE Register_Form SHALL mostrar un enlace de texto "¿Ya tienes cuenta? Inicia sesión" que navegue a `/auth/login`.
3. WHEN el usuario hace clic en el enlace de registro desde el Login_Form, THE Router SHALL navegar a `/auth/register` sin recargar la página.
4. WHEN el usuario hace clic en el enlace de login desde el Register_Form, THE Router SHALL navegar a `/auth/login` sin recargar la página.

---

### Requirement 5: Servicio de Autenticación HTTP

**User Story:** Como desarrollador, quiero un servicio dedicado que maneje las peticiones HTTP de login y registro, para que la lógica de comunicación con el backend esté centralizada y sea reutilizable.

#### Acceptance Criteria

1. THE Auth_Service SHALL exponer un método `loginHttp(email: string, password: string): Observable<AuthResponse>` que realice una petición POST a `/api/auth/login`.
2. THE Auth_Service SHALL exponer un método `registerHttp(name: string, email: string, password: string): Observable<AuthResponse>` que realice una petición POST a `/api/auth/register`.
3. WHEN el método `loginHttp` es invocado, THE Auth_Service SHALL enviar el cuerpo `{email, password}` en formato JSON.
4. WHEN el método `registerHttp` es invocado, THE Auth_Service SHALL enviar el cuerpo `{name, email, password}` en formato JSON.
5. WHEN el Backend_API responde exitosamente, THE Auth_Service SHALL retornar un Observable que emita el objeto `{token: string}`.
6. WHEN el Backend_API responde con error, THE Auth_Service SHALL propagar el error HTTP para que el componente lo maneje.

---

### Requirement 6: Tests Unitarios de LoginComponent

**User Story:** Como desarrollador, quiero tests unitarios para LoginComponent, para que pueda verificar que el formulario valida correctamente y maneja respuestas del backend.

#### Acceptance Criteria

1. THE LoginComponent SHALL tener un test que verifique que el formulario se inicializa con campos email y password vacíos.
2. THE LoginComponent SHALL tener un test que verifique que el botón de envío está deshabilitado cuando los campos son inválidos.
3. THE LoginComponent SHALL tener un test que verifique que el botón de envío está habilitado cuando los campos son válidos.
4. THE LoginComponent SHALL tener un test que verifique que se muestran mensajes de error cuando los campos son inválidos y el usuario intenta enviar.
5. THE LoginComponent SHALL tener un test que verifique que se invoca `AuthService.loginHttp` con los datos correctos cuando el formulario es válido y se envía.
6. THE LoginComponent SHALL tener un test que verifique que se invoca `AuthService.login(token)` cuando el backend responde exitosamente.
7. THE LoginComponent SHALL tener un test que verifique que se navega a `/experiences` cuando el login es exitoso.
8. THE LoginComponent SHALL tener un test que verifique que se muestra un mensaje de error cuando el backend responde con 401.
9. THE LoginComponent SHALL tener un test que verifique que se muestra un indicador de carga mientras la petición está en curso.

---

### Requirement 7: Tests Unitarios de RegisterComponent

**User Story:** Como desarrollador, quiero tests unitarios para RegisterComponent, para que pueda verificar que el formulario valida correctamente y maneja respuestas del backend.

#### Acceptance Criteria

1. THE RegisterComponent SHALL tener un test que verifique que el formulario se inicializa con campos name, email y password vacíos.
2. THE RegisterComponent SHALL tener un test que verifique que el botón de envío está deshabilitado cuando los campos son inválidos.
3. THE RegisterComponent SHALL tener un test que verifique que el botón de envío está habilitado cuando los campos son válidos.
4. THE RegisterComponent SHALL tener un test que verifique que se muestran mensajes de error cuando los campos son inválidos y el usuario intenta enviar.
5. THE RegisterComponent SHALL tener un test que verifique que se invoca `AuthService.registerHttp` con los datos correctos cuando el formulario es válido y se envía.
6. THE RegisterComponent SHALL tener un test que verifique que se invoca `AuthService.login(token)` cuando el backend responde exitosamente.
7. THE RegisterComponent SHALL tener un test que verifique que se navega a `/experiences` cuando el registro es exitoso.
8. THE RegisterComponent SHALL tener un test que verifique que se muestra un mensaje de error cuando el backend responde con 409 (email duplicado).
9. THE RegisterComponent SHALL tener un test que verifique que se muestra un indicador de carga mientras la petición está en curso.

---

### Requirement 8: Manejo de Estado de Carga

**User Story:** Como usuario, quiero ver un indicador visual cuando el formulario está procesando mi solicitud, para que sepa que la aplicación está trabajando y no intente enviar el formulario múltiples veces.

#### Acceptance Criteria

1. THE Login_Form SHALL tener una propiedad booleana `isLoading` que se establezca en `true` cuando se envía el formulario.
2. THE Register_Form SHALL tener una propiedad booleana `isLoading` que se establezca en `true` cuando se envía el formulario.
3. WHEN `isLoading` es `true` en el Login_Form, THE Login_Form SHALL deshabilitar el botón de envío y mostrar el texto "Iniciando sesión..." en lugar de "Iniciar sesión".
4. WHEN `isLoading` es `true` en el Register_Form, THE Register_Form SHALL deshabilitar el botón de envío y mostrar el texto "Registrando..." en lugar de "Registrarse".
5. WHEN el Backend_API responde (exitosamente o con error), THE Login_Form SHALL establecer `isLoading` en `false`.
6. WHEN el Backend_API responde (exitosamente o con error), THE Register_Form SHALL establecer `isLoading` en `false`.

---

### Requirement 9: Accesibilidad de Formularios

**User Story:** Como usuario con tecnologías de asistencia, quiero que los formularios de login y registro sean accesibles, para que pueda navegar y completar los formularios usando lectores de pantalla o teclado.

#### Acceptance Criteria

1. THE Login_Form SHALL tener etiquetas `<label>` asociadas a cada campo de entrada mediante el atributo `for`.
2. THE Register_Form SHALL tener etiquetas `<label>` asociadas a cada campo de entrada mediante el atributo `for`.
3. WHEN un campo del Login_Form tiene un Validation_Error, THE Login_Form SHALL asociar el mensaje de error al campo mediante el atributo `aria-describedby`.
4. WHEN un campo del Register_Form tiene un Validation_Error, THE Register_Form SHALL asociar el mensaje de error al campo mediante el atributo `aria-describedby`.
5. THE Login_Form SHALL tener el atributo `role="form"` en el elemento `<form>`.
6. THE Register_Form SHALL tener el atributo `role="form"` en el elemento `<form>`.
7. WHEN el botón de envío está deshabilitado, THE Login_Form SHALL incluir el atributo `aria-disabled="true"` en el botón.
8. WHEN el botón de envío está deshabilitado, THE Register_Form SHALL incluir el atributo `aria-disabled="true"` en el botón.

---

### Requirement 10: Validación de Email en Tiempo Real

**User Story:** Como usuario, quiero ver feedback inmediato cuando ingreso un email inválido, para que pueda corregir el error antes de enviar el formulario.

#### Acceptance Criteria

1. WHEN el usuario escribe en el campo email del Login_Form y el valor no tiene formato de email válido, THE Login_Form SHALL mostrar el mensaje "Ingresa un email válido" debajo del campo.
2. WHEN el usuario escribe en el campo email del Register_Form y el valor no tiene formato de email válido, THE Register_Form SHALL mostrar el mensaje "Ingresa un email válido" debajo del campo.
3. WHEN el usuario deja vacío el campo email del Login_Form y el campo pierde el foco, THE Login_Form SHALL mostrar el mensaje "El email es requerido" debajo del campo.
4. WHEN el usuario deja vacío el campo email del Register_Form y el campo pierde el foco, THE Register_Form SHALL mostrar el mensaje "El email es requerido" debajo del campo.
5. WHEN el usuario corrige el email a un formato válido, THE Login_Form SHALL ocultar el mensaje de error del campo email.
6. WHEN el usuario corrige el email a un formato válido, THE Register_Form SHALL ocultar el mensaje de error del campo email.
