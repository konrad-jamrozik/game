# About deployment setup

## How the API backend GitHub actions workflow was created

The backend API deployment configuration is a GitHub actions workflow [`.github/workflows/main_api-game-lib.yml`].

I have initially created it using [api-game-lib Deployment Center] per the [Continuous deployment to Azure App Service]
article. Once I clicked the relevant button in Azure portal, it has pushed
[this commit][commit with API GHAW from Depl Center].
The file was not yet working correctly, though, and I had to fix it by making [this commit][commit with API GHAW fix].

Having the GitHub actions workflow created from the deployment center shows that it is connected to GitHub, in `Settings`
pane in the [Deployment Center Azure view][api-game-lib Deployment Center]. There are also few other benefits, like
logs being synced from the GitHub runner logs to the center, as explained in [the FAQ][Azure App Service CD FAQ].

Note that previously I had another GitHub actions workflow for deploying the API, the `api-game-lib.yml`.
Per [its history][api-game-lib.yml git history], at first I created it by following:

- [Tutorial: Create a minimal API with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio),
to create the stub API.
- [Quickstart: Deploy an ASP.NET web app](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore?tabs=net70&pivots=development-environment-vs),
to deploy the API to Azure.

However, it appears to be obsolete. I created it in August 2023, but I was unable to reproduce it in December 2023.
Overall, the story for creating GitHub actions workflow for ASP.NET Core .NET Web App is messy, as I documented here:

- [The documentation about creating GitHub Actions workflow for CI/CD for .NET Core Azure Web App needs consolidation #118243](https://github.com/MicrosoftDocs/azure-docs/issues/118243).

When deleting `api-game-lib.yml`, I also removed its secret from [GitHub actions secrets], `API_GAME_LIB_65C2`.

## How the web fronted GitHub actions workflow was created

The frontend web deployment configuration is a GitHub actions workflow [`.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml`].

That workflow was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml))
by following these instructions:

- [Vite / Deploying a Static Site / Azure Static Web Apps](https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps)
- [Build configuration for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions)

Specifically, I used the [Azure Static Web Apps VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)
wizard to configure the deployment, per `Vite / Deploying a Static Site / Azure Static Web Apps`:
> Follow the wizard started by the extension to give your app a name, choose a framework preset,
> and designate the app root (usually /) and built file location /dist. The wizard will run and will
> create a GitHub action in your repo in a .github folder.

This created the GitHub actions workflow, which looks like the [Build configuration here](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#build-configuration).

## Secrets

- `AZUREAPPSERVICE_PUBLISHPROFILE_D5F222C936074008827578A5DCB17571`:
  A secret in the [GitHub actions secrets] used by the
  [`.github/workflows/main_api-game-lib.yml`]
  GitHub actions workflow.

- `AZURE_STATIC_WEB_APPS_API_TOKEN_ZEALOUS_SEA_0FFC3931E`:
  A secret in the [GitHub actions secrets] used by the
  [`.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml`]
  GitHub actions workflow.

<!--
--------------------------------------------------------------------------------
references
--------------------------------------------------------------------------------
-->

[api-game-lib Deployment Center]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourceGroups/game-web/providers/Microsoft.Web/sites/api-game-lib/vstscd
[Continuous deployment to Azure App Service]: https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github
[Azure App Service CD FAQ]: https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github#frequently-asked-questions
[commit with API GHAW from Depl Center]: https://github.com/konrad-jamrozik/game/commit/9f1f5143aab4953ffc821fda2b0f18cb9825dc18
[commit with API GHAW fix]: https://github.com/konrad-jamrozik/game/commit/463e9e74ef2b89cbb2ef1755b0bfb830208722f4
[api-game-lib.yml git history]: https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/api-game-lib.yml
[GitHub actions secrets]: https://github.com/konrad-jamrozik/game/settings/secrets/actions
[`.github/workflows/main_api-game-lib.yml`]: ../.github/workflows/main_api-game-lib.yml
[`.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml`]: ../.github/workflows/azure-static-web-apps-zealous-sea-0ffc3931e.yml
