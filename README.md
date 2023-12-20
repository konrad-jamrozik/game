# About

[![License: CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc/4.0/)

This repository contains personal code of Konrad Jamrozik, written for his game prototype.

# Sources overview

The game is composed of two components: web SolidJS frontend and C# API backend.

- The web SolidJS frontend source is in [web](web) dir.
- The C# API backend is in [src](src) dir.

# Deploy to Azure

# Deploy to localhost

# About deployment setup

The backend API deployment configuration is a GitHub Action workflow [.github/workflows/api-game-lib.yml](.github/workflows/api-game-lib.yml)
which was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/api-game-lib.yml))
by following these instructions:

- [Tutorial: Create a minimal API with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio)
- [Quickstart: Deploy an ASP.NET web app](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore?tabs=net70&pivots=development-environment-vs)

The frontend web deployment configuration is a GitHub action workflow [.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml](.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml)
which was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml))
by following these instructions:

- [Vite / Deploying a Static Site / Azure Static Web Apps](https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps)
- [Build configuration for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions)

# License

See [LICENSE](LICENSE)

# Attribution

Code in this repository leverages faction names X-COM Files by SolariusScorch.
[Link to SolariusScorch / XComFiles repository](https://github.com/SolariusScorch/XComFiles).
