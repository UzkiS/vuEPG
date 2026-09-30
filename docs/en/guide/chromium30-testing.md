---
description: "Install and run Docker Chromium 30 regression for Vue 2.7 production, webpack development, navigation, scrolling and dialogs, with logs and screenshots."
---

# Chromium 30 regression tests

Docker provides Chromium 30, ChromeDriver and Xvfb to check the Vue 2.7 example's production and webpack development entries. Versions are checked during installation and session creation.

## Requirements

- Use the project's Node and pnpm versions.
- Docker must be running with linux/amd64 container support.
- First installation needs network access to archives and image dependencies.
- Ports 5174 and 5175 must be available.

The installer supplies browsers, drivers, libraries, fonts and Xvfb. Apple Silicon uses amd64 emulation.

## Install and run

From the vuEPG repository root:

```sh
pnpm install
pnpm legacy:install
pnpm test:chrome30
```

An independent example uses the same commands in its directory. Installation checks archives and builds the fixed image; testing builds the application and runs assertions. Success exits 0, failure exits nonzero and preserves logs/screenshots. Test-owned containers and services are released afterward.

## Coverage

| Area            | Checks                                                             |
| --------------- | ------------------------------------------------------------------ |
| Startup         | ES5 application, polyfills and default focus                       |
| Input           | Directions, Confirm and Back                                       |
| Navigation      | Loops and page restoration                                         |
| Dialogs         | Boundaries, Back priority, restoration and invalid-target fallback |
| Dynamic content | Hidden, Vue-unmounted and detached focus recovery                  |
| Scrolling       | Out-of-viewport targets                                            |
| Development     | webpack startup, CSS updates and focus retention                   |
| Vite entry      | HTML loads, module scripts exist, application does not mount       |

The Vite comparison checks legacy development behavior; production and webpack cover normal working flows.

## Results

Repository results are in examples/tv-training/legacy-results; copied projects use their own legacy-results directory. Each run creates a new subdirectory.

| File                                       | Contents                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| report.json                                | Status, browser/driver, package version and bundle hashes |
| assertions.json                            | Individual assertion results                              |
| production*.png / webpack-development*.png | Page, scroll and dialog captures                          |
| vite-development.png                       | Vite page capture                                         |
| *-browser.json                             | Browser and resource errors                               |
| chromedriver.log / xvfb.log / server.log   | Driver, graphics and resource logs                        |
| failure.txt / failure.png                  | Failure details and page state                            |

CI runs the same commands and uploads the chrome30-results artifact.

## Fixed environment

Versions, base image and download checksums are in [manifest.json](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/legacy/chrome30/manifest.json). Docker fixes direct dependency versions and supplies compatibility libraries. ChromeDriver 2.8 officially supports [Chrome 30–33](https://chromedriver.storage.googleapis.com/2.8/notes.txt).

Archives are cached in .cache/legacy and checked with SHA-256. Caches and results are ignored. Remove project caches, results and matching containers/images:

```sh
pnpm legacy:clean
```

## Troubleshooting

| Issue                         | Check                                                     |
| ----------------------------- | --------------------------------------------------------- |
| Docker unavailable            | Service and docker info permissions                       |
| Download/checksum failure     | Network, archive and manifest checksum                    |
| Container cannot execute      | amd64/emulation support                                   |
| Dependency installation fails | Build logs and fixed versions                             |
| Development unreachable       | Ports, firewall, host.docker.internal and 0.0.0.0 binding |
| Browser startup fails         | Driver/Xvfb logs and libraries                            |
| Updates fail                  | WebSocket and fetch polyfill                              |

Production is served inside the container. Docker Desktop accesses dev servers through host.docker.internal; Linux Docker Engine uses host-gateway.

## Host platform records

| Host                                       | Status                                              |
| ------------------------------------------ | --------------------------------------------------- |
| WSL2 / Ubuntu 24.04 + Docker Desktop amd64 | Regression passed                                   |
| Linux Docker Engine amd64                  | CI configured                                       |
| Windows/macOS + Docker Desktop             | Shared Linux image; host execution not yet verified |
| Apple Silicon                              | amd64 emulation; not yet verified                   |

Desktop tests cover browser behavior. For native protocols, resources and performance, see [Device integration](./legacy-webview#reproduce-and-check).
