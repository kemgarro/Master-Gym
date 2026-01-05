# Entrega MasterGym (Instalacion Local)

Este documento describe la instalacion completa para entregar MasterGym en una PC local.

## Requisitos (instalar una sola vez)

1) Java 21 (JDK)
2) Node.js 20 (LTS)
3) PostgreSQL 14+

## Paso 1: Configurar la base de datos local

1. Abrir PostgreSQL y crear una base de datos:

   - Nombre sugerido: mastergym_dev

2. Tener un usuario y password (ej: postgres / tu_password).

## Paso 2: Configurar variables del backend

Archivo: backend/.env

Ejemplo:

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mastergym_dev
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=tu_password

APP_SECURITY_USERNAME=admin
APP_SECURITY_PASSWORD=tu_password_segura
APP_SECURITY_JWT_SECRET=tu_jwt_largo_de_al_menos_32_chars
APP_SECURITY_TOKEN_MINUTES=480
APP_SECURITY_GYM_ID=1

APP_BACKUP_TOKEN=tu_token_largo

## Paso 3: Configurar variables de la UI

Archivo: ui/.env.local

Ejemplo:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_BACKUP_TOKEN=tu_token_largo

## Paso 4: Instalacion (una sola vez)

1. Copiar la carpeta del proyecto al PC del cliente.
2. Ejecutar:

   launcher/Instalar-MasterGym.vbs

Esto hace:
- Instala dependencias de la UI.
- Genera build del backend y frontend.
- Crea el icono MasterGym en el escritorio.

## Paso 5: Uso diario

- Doble clic en el icono MasterGym del escritorio.
  - Si esta apagado, lo abre y carga el navegador.
  - Si esta encendido, lo cierra.

## Respaldo en la nube

- El boton "Respaldar" usa APP_BACKUP_TOKEN.
- Asegurate de que el token sea igual en backend/.env y ui/.env.local.

## Logs (si hay errores)

- logs/backend.log
- logs/ui.log

## Notas

- No compartir el contenido de backend/.env ni ui/.env.local.
- Guardar los tokens en un lugar seguro.
