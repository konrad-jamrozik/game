# Secrets

- `AZURE_GAME_API1_PUBLISH_PROFILE`:
  A secret in the [GitHub Actions secrets] used by the
  [`.github/workflows/api_CICD.yml`]
  GitHub actions workflow.
  This secret is the publish profile for the Azure web app [`kojamroz VS Enterprise Sub / game-rg / game-api1`].
  Originally configured as part of [GitHub doc on Deploying to Azure App Service].

- `AZURE_GAME_WEB_DEPLOYMENT_TOKEN`:
  A secret in the [GitHub Actions secrets] used by the
  [`.github/workflows/web_CICD.yml`]
  GitHub actions workflow.
  This secret is the deployment token for the Azure static web app [`kojamroz VS Enterprise Sub / game-rg / game-web`].
  Originally configured as part of [GitHub doc on Deploying to Azure Static Web App].

<!--
## references
-->

[GitHub Actions secrets]: https://github.com/konrad-jamrozik/game/settings/secrets/actions
[`.github/workflows/web_CICD.yml`]: ../.github/workflows/web_CICD.yml
[`.github/workflows/api_CICD.yml`]: ../.github/workflows/api_CICD.yml
[`kojamroz VS Enterprise Sub / game-rg / game-web`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/staticSites/game-web/staticsite
[`kojamroz VS Enterprise Sub / game-rg / game-api1`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/sites/game-api1/appServices
[GitHub doc on Deploying to Azure App Service]: https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-azure/deploying-net-to-azure-app-service
[GitHub doc on Deploying to Azure Static Web App]: https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-azure/deploying-to-azure-static-web-app
