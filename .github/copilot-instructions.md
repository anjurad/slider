# Slider - HTML5 Slide Presentation Application

Slider is a single-file HTML5 slide presentation application that renders Markdown content as interactive slides. The main application is entirely contained in `slider.html` (2,342 lines) with embedded CSS, JavaScript, and HTML.

**ALWAYS reference these instructions first and only fallback to additional search and bash commands when you encounter unexpected information that does not match the information provided here.**

## Working Effectively

### Bootstrap and Dependencies
- **REQUIRED**: Install dependencies first (local dev):
  ```bash
  npm install
  ```
  - Takes ~11 seconds to complete
  - Installs 257 packages including Playwright, Vitest, ESLint, TypeScript

  For CI or reproducible installs, prefer:
  ```bash
  npm ci
  ```
  This installs from package-lock.json and ensures repeatable CI builds.

### When Browser Installation Fails
If `npx playwright install --with-deps` fails due to network restrictions:
- **Still validate core functionality**: Run `npm run lint` and `npm run test:unit`
- **Manual browser testing is CRITICAL**: Open application in your local browser
- **Focus on unit test coverage**: 21 unit tests validate extracted utility functions
- **Document limitations**: Note in pull requests that E2E validation was done manually
- **CI environment**: GitHub Actions CI has proper network access and will run all E2E tests

### Linting - ALWAYS Required Before Committing
- **CRITICAL**: Run linting before any commit or the CI will fail:
  ```bash
  npm run lint
  ```
  - Takes ~3 seconds to complete
  - Uses ESLint with TypeScript support
  - Must pass with zero warnings (--max-warnings=0)
  - Lints all .js and .ts files in the repository

Note: If you see a TypeScript parser warning from ESLint (about incompatible versions), align your local TypeScript version with the project's devDependencies (the project pins a TypeScript version compatible with @typescript-eslint). See package.json for the exact version used in CI.

### Testing
- **Unit Tests** (fast, always run these):
  ```bash
  npm run test:unit
  ```
  - Takes ~3 seconds, NEVER CANCEL - let it complete
  - Runs 21 Vitest unit tests, all should pass
  - Tests extracted utility functions in `unit/` directory
  - Safe to run frequently during development

- **E2E Tests** (comprehensive but requires browser setup):
  ```bash
  # Install browsers first - REQUIRED for E2E tests
  npx playwright install --with-deps
  ```
  - **CRITICAL**: Browser installation takes 10-15 minutes. NEVER CANCEL this process.
  - **NOTE**: Browser downloads may fail in some network environments (firewall/proxy restrictions)
  - If browser install fails, E2E tests cannot run, but unit tests and linting still validate core functionality
  - Set timeout to 20+ minutes for browser installation commands

  ```bash
  npm run test:e2e
  ```
  - Takes ~20 seconds when browsers are installed, NEVER CANCEL
  - Runs 56 Playwright E2E tests  
  - Tests actual user interactions with the slide application
  - **IMPORTANT**: If browsers are not installed, this will fail immediately
  - Set timeout to 30+ minutes for E2E test commands

  ```bash
  # Alternative: Use the helper script that handles everything
  ./dev-tools/run-playwright-only.sh
  ```
  - **NEVER CANCEL**: Full script takes 15-20 minutes (browser install + tests)
  - **NOTE**: May fail if browser downloads are blocked by network restrictions
  - Set timeout to 30+ minutes
  - Installs dependencies, browsers, and runs E2E tests

### Running the Application
- **No build step required** - the application runs directly in any modern web browser
- Open `slider.html` directly in a browser:
  ```bash
  # Start local HTTP server to serve files
  python3 -m http.server 8000
  # Then navigate to: http://localhost:8000/slider.html
  ```
- **Alternative**: Open `file:///path/to/slider.html` directly in browser
- Loads sample presentation (`sample_presentation.md`) automatically on first run

## Manual Validation Requirements

**CRITICAL**: After making changes, you MUST manually validate the application functionality:

### Core User Scenarios - Test ALL of These
1. **Load and Navigate**:
   - Open the application in browser
   - Verify sample slides load automatically
   - Use arrow keys to navigate between slides (Left/Right arrows)
   - Verify slide counter updates (e.g., "1/8" in bottom right)
   - Check that thumbnails appear in left sidebar and highlight active slide

2. **File Loading**:
   - Click "Load Markdown" button (📁 icon in top toolbar)
   - Select `sample_presentation.md` from the file picker
   - Verify slides reload with new content
   - Navigate through at least 3 slides to confirm rendering

3. **Keyboard Shortcuts**:
   - Press `T` key - toggles slide transparency (0% ↔ 100%)
   - Press `U` key - toggles UI visibility on/off
   - Press `P` key - toggles progress bar
   - Press `O` key - toggles text outline
   - Verify each hotkey works and CSS changes are applied

4. **Style and Theming**:
   - Click "Style" button (🎨 icon) to open Style modal
   - Select a different color preset button
   - Click "Save" and verify colors change throughout the application
   - Click "Reset" to restore defaults

5. **Interactive Features**:
   - Click "Notes" button (📝 icon) - notes panel should appear/disappear at bottom
   - Click "Background" button (🌌 icon) - cycles through background modes
   - Click "Slides" button (🧭 icon) - thumbnail drawer slides in from left
   - Click previous/next arrows at bottom - verify navigation

## Key Repository Structure

### Main Files
- `slider.html` - Main application (2,342 lines, single-file HTML/CSS/JS)
- `sample_presentation.md` - Sample Markdown content for testing
- `package.json` - npm scripts and dependencies
- `playwright.config.ts` - E2E test configuration
- `tsconfig.json` - TypeScript configuration

### Directories
- `tests/` - 56 Playwright E2E test files
- `unit/` - 21 Vitest unit test files 
- `src/` - Modular code extraction (work in progress, some functions moved here)
- `dev-tools/` - Helper scripts and debugging utilities
- `docs/` - Documentation including refactor plan

### Important Config Files
- `.eslintrc.cjs` - ESLint configuration with TypeScript support
- `.prettierrc` - Code formatting rules
- `.github/workflows/ci.yml` - CI pipeline (lint → unit tests → E2E tests)

## Common Tasks and Timing

### Development Workflow
1. **Start development**: `npm install` (~11s)
2. **Make code changes** 
3. **Test changes**: `npm run test:unit` (~3s) 
4. **Lint code**: `npm run lint` (~3s)
5. **Manual validation**: Open application in browser and test core scenarios
6. **Full E2E testing**: `npm run test:e2e` (~20s, requires browser install first)

### Alternative Validation When E2E Tests Cannot Run
If browser installation fails, use this validation approach:
1. **Unit tests**: `npm run test:unit` (21 tests, ~3s)
2. **Linting**: `npm run lint` (required for CI)
3. **Manual browser testing**: Open `slider.html` and test all core scenarios
4. **Code review**: Focus on unit test coverage and code quality
5. **CI validation**: GitHub Actions will run full E2E test suite

### CI Pipeline Expectations
- **Lint job**: ~30s
- **Unit test job**: ~45s  
- **E2E test job**: 3-5 minutes per browser (runs on Chromium, Firefox, WebKit)
- **NEVER CANCEL**: Total CI time can be 10-15 minutes, this is normal

### Build and Refactoring Notes
- **No traditional build process** - this is a single-file HTML application
- Refactoring is in progress to extract code to `src/` directory (see `docs/refactor-plan.md`)
- Changes should maintain backwards compatibility with existing single-file structure
- Always run full test suite when making architectural changes

## Frequently Used Commands Reference

```bash
# Quick development cycle
npm install              # Install dependencies (~11s)
npm run lint            # Lint code (~1s) - REQUIRED before commit
npm run test:unit       # Unit tests (~3s) - run frequently

# Full testing (requires browser install)
npx playwright install --with-deps  # 15-20 min, NEVER CANCEL
npm run test:e2e        # E2E tests (~20s)

# Alternative: all-in-one script  
./dev-tools/run-playwright-only.sh  # 15-20 min total, NEVER CANCEL

# Development server for manual testing
python3 -m http.server 8000         # Serve files locally
# Then open: http://localhost:8000/slider.html
```

## Critical Warnings

- **NEVER CANCEL long-running commands** - browser installs and E2E tests take 15+ minutes
- **ALWAYS run `npm run lint`** before committing - CI will fail without this
- **ALWAYS manually test core user scenarios** after making changes
- **Set timeouts of 30+ minutes** for any command involving browser installation or E2E tests
- **The application has no build step** - changes to `slider.html` are immediately live

## Application Features Summary

The Slider application is a feature-rich presentation tool supporting:
- **Markdown rendering** with syntax highlighting, tables, images
- **Slide navigation** via keyboard, mouse, or thumbnail sidebar
- **Theming system** with color presets and custom styling
- **Interactive features**: notes, backgrounds, transparency, UI toggle
- **Keyboard shortcuts**: T (transparency), U (UI), P (progress), O (outline)
- **Export capabilities**: Print to PDF, fullscreen mode
- **Responsive design** that works on desktop and mobile browsers