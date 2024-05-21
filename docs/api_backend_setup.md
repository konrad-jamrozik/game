# Table of contents

- [Table of contents](#table-of-contents)
- [How the API backend project was set up](#how-the-api-backend-project-was-set-up)
  - [How the API backend GitHub actions workflow was created](#how-the-api-backend-github-actions-workflow-was-created)
    - [Original setup in August 2023](#original-setup-in-august-2023)
    - [Updated setup in December 2023](#updated-setup-in-december-2023)
- [Appendix](#appendix)
  - [App service plan creation error](#app-service-plan-creation-error)

# How the API backend project was set up

In this document `.` refers to the repository root.

The code in [`./src/api`] contains the entry point of an ASP.NET Core application
using minimal API and coded with C#, per [Tutorial: Create a minimal API with ASP.NET Core].

## How the API backend GitHub actions workflow was created

### Original setup in August 2023

> [!WARNING]
> The contents of this section do not reflect current state of affairs. For that, see the section below.

The backend API deployment configuration is a GitHub actions workflow [`.github/workflows/api_CICD.yml`].

I have initially created it using the equivalent of [`game-api1` Deployment Center], but for
`api-game-lib` (since deleted) per the [Continuous deployment to Azure App Service]
article. Once I clicked the relevant button in Azure portal, it has pushed
[commit 9f1f514: GitHub Action workflow from Deployment Center].
The file was not yet working correctly, though, and I had to fix it by making [commit 463e9e7: fix GitHub Actions workflow].

Having the GitHub actions workflow created from the deployment center shows that it is connected to GitHub, in `Settings`
pane in the Deployment Center Azure view, as e.g. seen in [`game-api1` Deployment Center].
There are also few other benefits, like logs being synced from the GitHub runner logs to the center,
as explained in [the FAQ][Azure App Service CD FAQ].

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

### Updated setup in December 2023

Once I made [commit 847b607: rename workflows to *CICD.yml] I ran into problems with making the Azure resources
properly linking to the GitHub Actions workflow. I elaborate on relevant problems for the Azure static web app in
[this doc](web_frontend_setup.md#step-41-update-the-workflow-based-on-github-guidance-for-azure-static-web-apps).

As a result I decided to redo the Azure resources and manually connect them to the GitHub Actions workflow files.

For API backend, I did the following, based on [GitHub doc on Deploying to Azure App Service]:

1. I manually created the Azure web app, [`game-api1`]. I had to use `api1` as name with `api` was taken.
1. I manually created Azure app service plan, [`game-app-service-plan-windows`].
1. In the [`game-api1`] I went to `Deployment Center`, `Settings` and connected to GitHub. I've chosen to use
   existing workflow.
   - See additional notes below about this step.
1. In the `Deployment Center` I clicked `Manage publish profile`, downloaded it, and added it as a secret to
   [GitHub Actions secrets] as `AZURE_GAME_API1_PUBLISH_PROFILE`.
   - This corresponds to step 3 from [GitHub doc on Deploying to Azure App Service] and `Publish profile` variant
     from the [Deploy to App Service using GitHub Actions / Generate deployment credentials] article.
1. Configured [`game-api1`] CORS to allow the frontend Azure static web app of `https://witty-grass-034c9c41e.4.azurestaticapps.net`.
1. I made relevant code changes so that the GitHub Actions workflow file uses the new [`game-api1`] resource, as well
   as frontend talks to it. This can be seen in [commit fc109b3: update sources to use `game-api1`].
   - See additional notes below about this step.

> [!WARNING]
> Because I am using .NET 8, the app service plan must be on Windows, not Linux. On Linux the app won't recognize .NET 8.0,
> as explained by [`early-access.md`]. This doc is linked from the web app creation wizard, by the dropdown
> for choosing .NET version. When deployed on Linux everything looks good, but the app returns 503. I discovered
> the logs with root-cause by going to the Azure Portal for [`game-api1`], going to `Development Tools`, clicking
> `Advanced Tools`, and then `go ->` to open the [admin panel] with logs.

> [!WARNING]
> Because I wanted to use the cheapest Basic B1 pricing plan, I had to create the app service plan on `West US` instead
> of `West US 2`, even though `West US 2` is closes to my location. It cannot be created on `West US 2` because
> it fails with the cryptic error of `SubscriptionIsOverQuotaForSku`. See [here](#app-service-plan-creation-error).

> [!NOTE]
> Note that in the commit [commit fc109b3: update sources to use `game-api1`], I also bumped the versions of the used
> GitHub Actions. To determine newest version of each action, I ctrl-clicked their names in VS Code, which took me to
> their GitHub repo page. I then looked at available branch names to find what is the highest `X` for branch names `vX`,
> e.g. [`download-artifact/v4`].

# Appendix

## App service plan creation error

Full error message:

> Validation failed for a resource. Check `Error.Details[0]` for more information. (Code: ValidationForResourceFailed)
>
> This region has quota of 0 instances for your subscription. Try selecting different region or SKU. (Code: > SubscriptionIsOverQuotaForSku)

- https://stackoverflow.com/questions/70095562/i-get-a-deployment-error-when-trying-to-publish-a-solution-to-azure

<!--
## references
-->

[`./src/api`]: ../src/api
[`.github/workflows/api_CICD.yml`]: ../.github/workflows/api_CICD.yml
[`download-artifact/v4`]: https://github.com/actions/download-artifact/tree/v4/
[`early-access.md`]: https://github.com/Azure/app-service-linux-docs/blob/master/Runtime_Support/early_access.md#early-access-on-linux
[`game-api1`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/sites/game-api1/appServices
[`game-api1` Deployment Center]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/sites/game-api1/vstscd
[`game-app-service-plan-windows`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourceGroups/game-rg/providers/Microsoft.Web/serverfarms/game-app-service-plan-windows/webHostingPlan
[admin panel]: https://game-api1.scm.azurewebsites.net/
[api-game-lib.yml git history]: https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/api-game-lib.yml
[Azure App Service CD FAQ]: https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github#frequently-asked-questions
[commit 463e9e7: fix GitHub Actions workflow]: https://github.com/konrad-jamrozik/game/commit/463e9e74ef2b89cbb2ef1755b0bfb830208722f4
[commit 847b607: rename workflows to *CICD.yml]: https://github.com/konrad-jamrozik/game/commit/847b607a2fb69066dfd917a073c52e1326e615e1
[commit 9f1f514: GitHub Action workflow from Deployment Center]: https://github.com/konrad-jamrozik/game/commit/9f1f5143aab4953ffc821fda2b0f18cb9825dc18
[commit fc109b3: update sources to use `game-api1`]: https://github.com/konrad-jamrozik/game/commit/fc109b3deef22116cc822952902319c3a5175417
[Continuous deployment to Azure App Service]: https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github
[Deploy to App Service using GitHub Actions / Generate deployment credentials]: https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=applevel#generate-deployment-credentials
[GitHub actions secrets]: https://github.com/konrad-jamrozik/game/settings/secrets/actions
[GitHub doc on Deploying to Azure App Service]: https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-azure/deploying-net-to-azure-app-service
[Tutorial: Create a minimal API with ASP.NET Core]: https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0
