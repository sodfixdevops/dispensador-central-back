# Instrucciones para GitHub Copilot / agentes AI

## Objetivo del proyecto

Backend NestJS para sistema de dispensador de billetes (ATM), gestionando transacciones, autorizaciones, desembolsos y dispositivos.

## Arquitectura general

**Feature-based modular monolith**:

- Estructura: `src/{feature}/{feature}.{controller,service,module,entity,interface}.ts`
- Módulos principales: `transaccion`, `desembolso`, `dispositivos`, `usuario`, `autorizacion`, `serial`, `conceptos`, `agencia`, `api`, `banco`
- Entry points: [src/main.ts](src/main.ts) (puerto 6005, CORS a `localhost:3002`, Swagger en `/api`) y [src/app.module.ts](src/app.module.ts)

**Base de datos multi-motor**:

- Soporta MySQL y MS SQL Server vía variable `DB_TYPE` (env)
- Config dinámica en [src/app.module.ts](src/app.module.ts) líneas 42-74 usando `TypeOrmModule.forRootAsync()`
- `synchronize: false` **SIEMPRE** — las migraciones se gestionan externamente
- Entities auto-discovery: `entities: [join(__dirname, '**', '*.entity.{ts,js}')]`

## Convenciones de código críticas

**Naming conventions (IMPERATIVO seguir esto)**:

- Entities/tablas: nombres abreviados en español + prefijos funcionales
  - Transacciones: `dptrn` (header), `dptrd` (detalle)
  - Dispositivos: `addisp`, Usuarios: `adusr`, Autorizaciones: `dpaut`
  - Seriales: `dpsrl`, Desembolsos: `dpdes`
- Columnas siguen patrón: `{tabla}{campo}` (ej: `dptrnntra`, `dptrnftra`, `addispcode`)
- Archivos siempre lowercase: `transaccion.controller.ts`, NO `Transaccion.controller.ts`

**Patrón transaccional estándar** (ver [src/transaccion/transaccion.service.ts](src/transaccion/transaccion.service.ts) líneas 21-27):

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  // lógica de negocio con múltiples writes
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

**Estructura estándar de módulos**:

- Controllers: thin layer, sólo routing y validación básica
- Services: toda la lógica de negocio (inyectar `@InjectDataSource()` para transacciones)
- Entities: decoradores TypeORM con nombres de columnas explícitos (`@Column({ name: 'dptrnntra' })`)
- Interfaces: DTOs para request/response bodies

## Flujo de desarrollo esencial

```bash
# Desarrollo local (watch mode)
npm run start:dev

# Build para producción
npm run build
npm run start:prod

# Tests
npm run test        # Unit tests (config en package.json jest section)
npm run test:e2e    # E2E tests (config en test/jest-e2e.json)

# Formateo/Lint
npm run format      # Prettier sobre src/ y test/
npm run lint        # ESLint con --fix
```

**Variables de entorno requeridas** (.env):

```
DB_TYPE=mysql|mssql
DB_HOST=localhost
DB_PORT=3306|1433
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_ENCRYPT=true|false  # Solo para mssql
```

## Integraciones y dependencias críticas

- **TypeORM**: v0.3.20 — entities con decoradores explícitos, NO active record pattern
- **Auth stack**: `@nestjs/jwt` + `jsonwebtoken` + `bcrypt` (usuarios en `src/usuario/`)
- **DB drivers**: `mysql2` (MySQL) y `mssql`+`tedious` (SQL Server)
- **API docs**: Swagger UI en `http://localhost:6005/api` (config en [src/main.ts](src/main.ts))
- **CORS**: hardcodeado a `localhost:3002` — cambiar requiere revisión

## Cambios que requieren aprobación

- **NO** cambiar `synchronize: false` en TypeORM config
- **NO** modificar rutas API existentes sin verificar consumers externos
- **NO** alterar nombres de columnas/tablas (rompe queries existentes)
- **NO** cambiar puerto 6005 ni CORS origin sin coordinar con frontend
- Migraciones de DB: usar herramientas externas, NO sync automático

## Archivos clave para onboarding

1. [src/app.module.ts](src/app.module.ts) — DB config y módulos registrados
2. [src/main.ts](src/main.ts) — Bootstrap, CORS, Swagger
3. [src/transaccion/transaccion.service.ts](src/transaccion/transaccion.service.ts) — Ejemplo completo de transacciones y patrón de negocio
4. [src/transaccion/dptrn.entity.ts](src/transaccion/dptrn.entity.ts) — Entity con naming convention típico
5. [src/utiles.ts](src/utiles.ts) — Tipo `ApiResponse<T>` para responses uniformes

## Preguntas frecuentes

**P: ¿Cómo agrego una nueva feature?**  
R: Crear carpeta `src/{feature}/` con: `{feature}.module.ts`, `{feature}.controller.ts`, `{feature}.service.ts`, `{feature}.entity.ts`, `{feature}.interface.ts`. Registrar módulo en [src/app.module.ts](src/app.module.ts).

**P: ¿Cómo manejo múltiples operaciones DB?**  
R: Usar QueryRunner pattern (ver ejemplo arriba). NO usar múltiples `repository.save()` sin transacción.

**P: ¿Dónde van los endpoints de autenticación?**  
R: Revisar `src/usuario/` y `src/autorizacion/` — JWT tokens en módulos user/adusr.

**P: ¿Cómo testeo localmente con DB?**  
R: Configurar `.env` con credenciales locales MySQL/MSSQL. Ver README.md estándar de NestJS.
