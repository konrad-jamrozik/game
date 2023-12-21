# About deployment setup

## How the API backend action workflow was created

The backend API deployment configuration is a GitHub Action workflow [.github/workflows/api-game-lib.yml](.github/workflows/api-game-lib.yml)
which was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/api-game-lib.yml))
by following these instructions:

- [Tutorial: Create a minimal API with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio)
- [Quickstart: Deploy an ASP.NET web app](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore?tabs=net70&pivots=development-environment-vs)

## How the web fronted GitHub action workflow was created

The frontend web deployment configuration is a GitHub action workflow [.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml](.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml)
which was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml))
by following these instructions:

- [Vite / Deploying a Static Site / Azure Static Web Apps](https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps)
- [Build configuration for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions)

Specifically, I used the [Azure Static Web Apps VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)
wizard to configure the deployment, per `Vite / Deploying a Static Site / Azure Static Web Apps`:
> Follow the wizard started by the extension to give your app a name, choose a framework preset, 
> and designate the app root (usually /) and built file location /dist. The wizard will run and will 
> create a GitHub action in your repo in a .github folder.

This created the GitHub Action workflow, which looks like the [Build configuration here](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#build-configuration).
