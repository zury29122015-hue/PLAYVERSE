# PLAYVERSE

**CREATE. PUBLISH. PLAY.**

Plataforma de videojuegos donde cualquier usuario puede crear un juego de dos formas distintas (importando un
proyecto o programándolo), publicarlo, y que otros lo jueguen, comenten y valoren. Incluye panel de administración
para revisar y aprobar cada envío antes de publicarse.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **Auth.js (NextAuth v5)** con credenciales (email + contraseña, JWT)
- **Monaco Editor** para Code Studio
- Almacenamiento de archivos en disco local (`public/uploads`)

## Puesta en marcha

1. **Variables de entorno**: ya existe un `.env` local con una `AUTH_SECRET` generada y
   `ADMIN_EMAIL` apuntando a tu correo — esa cuenta será promovida a administrador automáticamente
   la primera vez que te registres con ese correo. Si cambias de máquina, copia `.env.example`.

2. **Base de datos** (necesitas Docker Desktop, o cualquier Postgres 14+ accesible en
   `localhost:5432` — este entorno no tenía Docker instalado, así que falta este paso):

   ```bash
   docker compose up -d
   ```

3. **Instalar dependencias** (ya hecho si no tocaste `package.json`):

   ```bash
   npm install
   ```

4. **Crear las tablas y cargar categorías**:

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Arrancar el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

6. Abre `http://localhost:3000`, regístrate con el correo indicado en `ADMIN_EMAIL` para obtener
   la cuenta administradora, y entra a `/admin`.

## Estructura del proyecto

```
src/
  app/                 Rutas (App Router): páginas + API routes
    create/            Hub de creación: import, code
    admin/             Panel de administración
    api/               Endpoints REST (auth, proyectos, envíos, social)
  components/          Componentes de UI por dominio (games, create, admin, code-studio)
  lib/                 Prisma client, auth, validaciones (zod), storage, análisis de ZIP
prisma/
  schema.prisma        Modelo de datos completo
  seed.ts              Carga las 10 categorías iniciales
```

## Las dos formas de crear un videojuego

### 1. IMPORT GAME (`/create/import`)
Sube un `.zip` o selecciona una carpeta con archivos HTML/CSS/JS. El servidor:
- Analiza el contenido (sin ejecutarlo) y detecta el archivo `index.html` de inicio.
- Detecta si parece una build de **Unity WebGL** (carpeta `Build/*.wasm|*.data`, `TemplateData/`) o una
  exportación **HTML5 de Godot** (`*.pck`), o un proyecto HTML5 genérico.
- Bloquea extensiones peligrosas (`.exe`, `.sh`, `.dll`, etc.) y rutas con `..` (path traversal).
- Si no encuentra un `index.html`, muestra un error explicando qué falta.
- Al terminar, muestra una vista previa en un `<iframe sandbox>` y un formulario de metadatos antes de
  enviarlo a revisión.

### 2. CODE STUDIO (`/create/code`)
Editor estilo IDE oscuro con Monaco (resaltado de sintaxis, números de línea, autocompletado),
explorador de archivos (crear/eliminar archivos HTML/CSS/JS), botón **RUN** que compila tus archivos en
memoria y los ejecuta en un `<iframe sandbox>` aislado con una consola de errores/logs en vivo
(se interceptan `console.log/warn/error` y `window.onerror` dentro del iframe y se reenvían al panel).
**SUBMIT GAME** materializa el bundle final a disco y abre el mismo formulario de envío a revisión.

## Revisión y publicación (`/admin`)

- **Dashboard** con contadores (pendientes, usuarios, juegos publicados, reportes).
- **PENDING GAMES**: lista de envíos con `APPROVE`, `REJECT` o `REQUEST CHANGES` (con nota opcional que
  se notifica al creador). Al aprobar se crea el `Game` público con slug único y se publica de inmediato;
  nada se publica sin pasar por aquí.
- Vista de detalle por envío con el juego jugable/previsualizable y los datos del creador.
- Gestión de usuarios (suspender/reactivar) y de reportes (descartar, resolver, o suspender el juego
  reportado).

## Seguridad (alcance de este MVP)

- Las contraseñas se guardan con `bcrypt`; las sesiones son JWT firmados con `AUTH_SECRET`.
- El rol de administrador solo se asigna por `ADMIN_EMAIL` en el servidor — nunca editable desde el
  perfil de un usuario normal.
- El código subido/escrito por usuarios **nunca se ejecuta en el servidor**: solo se sirve como archivos
  estáticos y corre en el navegador del jugador dentro de un `<iframe sandbox>`. El aislamiento real no
  depende solo del atributo `sandbox` del iframe (algunos navegadores se niegan a renderizar un iframe
  `sandbox` sin `allow-same-origin` cuando el contenido es del mismo origen que la página, así que ese
  flag sí está presente), sino de la cabecera `Content-Security-Policy: sandbox ...` que el servidor
  envía para todo lo que cuelga de `/uploads/games/*` (ver `next.config.ts`). Esa cabecera fuerza un
  origen opaco a nivel de respuesta HTTP, por lo que el contenido nunca puede leer las cookies de sesión
  ni el `localStorage` de PlayVerse, sin importar qué diga el `<iframe>` que lo embebe.
- Los ZIP importados se analizan antes de aceptarse (extensiones bloqueadas, límite de tamaño, y
  protección contra path traversal).
- **Limitación conocida**: esto es aislamiento a nivel de navegador (CSP + sandbox de iframe), no una
  sandbox de proceso en el servidor. Para un aislamiento más fuerte en producción (ideal para Unity
  WebGL/Godot pesados) se recomienda además servir el contenido importado desde un **subdominio o
  dominio separado** (por ejemplo `usercontent.tu-dominio.com`).

## Pendiente / próximos pasos sugeridos

- Levantar Postgres (Docker no estaba disponible en esta máquina) y correr `db:push` + `db:seed`.
- Migrar almacenamiento de archivos a S3/Supabase Storage para producción (hoy es disco local).
- Mover Unity WebGL / Godot a un subdominio separado para aislamiento de origen real.
- Añadir recuperación de contraseña por correo (hoy no existe, solo registro + login).
