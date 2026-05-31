# Changelog

All notable changes to this project will be documented in this file. / Todos los cambios notables de este proyecto se documentarán en este archivo.

## [Unreleased] - 2026-05-31

### 🇬🇧 English

#### Added
- **English Language Support (i18n):**
  - Added an `i18n.ts` configuration file with complete English and Spanish translation dictionaries.
  - Introduced a dynamic language selector in the Settings Modal.
  - Implemented automatic modal prompt for first-time users to select their preferred language along with their Emby and TMDb API keys.
  - Updated the main interface (`page.tsx`) and the `OverlaySelector` component to utilize the new translation system.

#### Changed
- Refactored hardcoded Spanish strings across the application to utilize the new `translations` object for seamless localization.

---

### 🇪🇸 Español

#### Añadido
- **Soporte para Idioma Inglés (i18n):**
  - Añadido un archivo de configuración `i18n.ts` con diccionarios de traducción completos en inglés y español.
  - Introducido un selector de idioma dinámico en la ventana modal de Ajustes.
  - Implementada la apertura automática del modal para nuevos usuarios, permitiendo elegir el idioma preferido junto con las API keys de Emby y TMDb.
  - Actualizada la interfaz principal (`page.tsx`) y el componente `OverlaySelector` para usar el nuevo sistema de traducciones.

#### Cambiado
- Refactorizados los textos en español que estaban fijos en el código de la aplicación para utilizar el nuevo objeto `translations`, permitiendo un cambio de idioma fluido.
