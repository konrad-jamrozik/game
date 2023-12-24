# Secrets

- `AZUREAPPSERVICE_PUBLISHPROFILE_D5F222C936074008827578A5DCB17571`:
  A secret in the [GitHub Actions secrets] used by the
  [`.github/workflows/api_CICD.yml`]
  GitHub actions workflow.

- `AZURE_GAME_WEB_DEPLOYMENT_TOKEN`:
  A secret in the [GitHub Actions secrets] used by the
  [`.github/workflows/web_CICD.yml`]
  GitHub actions workflow. 
  This secret is a deployment token for the Azure static web app [`kojamroz VS Enterprise Sub / game-rg / game-web`].

<!--
--------------------------------------------------------------------------------
references
--------------------------------------------------------------------------------
-->

[GitHub Actions secrets]: https://github.com/konrad-jamrozik/game/settings/secrets/actions
[`.github/workflows/web_CICD.yml`]: ../.github/workflows/web_CICD.yml
[`.github/workflows/api_CICD.yml`]: ../.github/workflows/api_CICD.yml
[`kojamroz VS Enterprise Sub / game-rg / game-web`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/staticSites/game-web/staticsite
