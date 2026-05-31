# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-05-31

### Added
- **English Language Support (i18n):**
  - Added an `i18n.ts` configuration file with complete English and Spanish translation dictionaries.
  - Introduced a dynamic language selector in the Settings Modal.
  - Implemented automatic modal prompt for first-time users to select their preferred language along with their Emby and TMDb API keys.
  - Updated the main interface (`page.tsx`) and the `OverlaySelector` component to utilize the new translation system.

### Changed
- Refactored hardcoded Spanish strings across the application to utilize the new `translations` object for seamless localization.
