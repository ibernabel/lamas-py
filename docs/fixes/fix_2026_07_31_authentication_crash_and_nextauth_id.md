# Fix: Corrección de Crash en Backend (NameError: logging) y Fallo de Autenticación en NextAuth v5

**Fecha:** 31 de Julio, 2026  
**Módulo:** Backend (`FastAPI`) & Frontend (`NextAuth.js v5`)  
**Estado:** ✅ Resuelto  

---

## 📑 1. Síntoma

Al intentar iniciar sesión desde la interfaz de usuario en `http://localhost:3000/login`:
1. El usuario recibía el mensaje de error: `"Credenciales incorrectas o usuario no aprobado"`.
2. En la consola del servidor Next.js se observaba la siguiente excepción:
   ```text
   [NextAuth] Exception during authorize: [TypeError: fetch failed] {
     [cause]: Error: connect ECONNREFUSED 127.0.0.1:8001
   }
   [auth][error] CredentialsSignin
   ```
3. Al intentar iniciar el servidor backend con `uv run uvicorn app.main:app --port 8001 --reload`, Uvicorn colapsaba inmediatamente arrojando:
   ```text
   File ".../backend/app/api/v1/endpoints/loan_applications.py", line 45, in <module>
       logger = logging.getLogger(__name__)
                ^^^^^^^
   NameError: name 'logging' is not defined. Did you forget to import 'logging'?
   ```

---

## 🔍 2. Causa Raíz

Se identificaron dos problemas concatenados:

1. **Crash en el Backend FastAPI (`NameError: logging`):**
   - Durante los cambios recientes en el flujo del formulario público de solicitudes en [loan_applications.py](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/loan_applications.py), se declaró la variable `logger = logging.getLogger(__name__)`, pero se omitió la sentencia `import logging` en la cabecera.
   - Al importar las rutas en `app/main.py`, Python lanzaba `NameError` e interrumpía el inicio del servidor, cerrando el puerto `8001` (`ECONNREFUSED 127.0.0.1:8001`).

2. **Invalidez de Objeto de Usuario en NextAuth.js v5:**
   - El endpoint del backend `/auth/login` devuelve únicamente el esquema de tokens `{ access_token, refresh_token, token_type }` (sin objeto `user`).
   - En [auth.ts](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/auth.ts), la función `authorize()` leía `data.user?.id`, resultando en `id: ""` (cadena vacía).
   - **NextAuth.js v5 invalida de inmediato la sesión si el objeto de usuario devuelto tiene un `id` vacío**, lo que provocaba que `signIn` fallara silenciosamente y arrojara `CredentialsSignin`.
   - Adicionalmente, `fetch` en el contexto del servidor carecía de un fallback explícito para la variable de entorno `process.env.NEXT_PUBLIC_API_URL`.

---

## 🛠️ 3. Solución Aplicada

### Backend

1. **[loan_applications.py](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/loan_applications.py#L15):**
   - Se añadió la importación estándar `import logging` en el encabezado del archivo, permitiendo la inicialización limpia de Uvicorn.

### Frontend

2. **[auth.ts](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/auth.ts#L29-L75):**
   - Se configuró la variable `apiBaseUrl` con fallback a `http://127.0.0.1:8001/api/v1`.
   - Tras validar las credenciales contra `/auth/login`, se incorporó una llamada secundaria hacia el endpoint de perfil `/auth/me` enviando la cabecera `Authorization: Bearer ${data.access_token}`.
   - Se asignaron los datos devueltos (`id`, `name`, `email`) al objeto retornado por `authorize()`, asegurando que `id` nunca sea una cadena vacía.
   - Se agregaron bloques de captura y registro de errores con `console.error` y `console.warn` para diagnósticos en desarrollo.

---

## 📂 4. Archivos Modificados

- [backend/app/api/v1/endpoints/loan_applications.py](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/loan_applications.py)
- [frontend/auth.ts](file:///Z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/auth.ts)

---

## 🧪 5. Verificación

1. **Inicio de Uvicorn Backend:**
   - Servidor iniciado correctamente en `http://127.0.0.1:8001`.
   - Comprobación del endpoint `/health` retornando `{"status": "healthy"}` con código HTTP 200.

2. **Análisis de Captura HAR (`lamas.har`):**
   - La inspección del registro de red confirmó que `/api/auth/callback/credentials` procesó exitosamente la solicitud de autenticación sin arrojar errores `CredentialsSignin`.

3. **Prueba de Inicio de Sesión:**
   - Autenticación exitosa en `http://localhost:3000/login` utilizando credenciales de usuario y redirección al Dashboard.
