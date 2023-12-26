# Table of contents

- [Table of contents](#table-of-contents)
- [Deployment](#deployment)
- [Deploy the API backend](#deploy-the-api-backend)
  - [Deploy API to Azure](#deploy-api-to-azure)
  - [Deploy API to localhost](#deploy-api-to-localhost)
    - [From Visual Studio](#from-visual-studio)
    - [From CLI](#from-cli)
- [Deploy the web app frontend](#deploy-the-web-app-frontend)
  - [Deploy web app to Azure](#deploy-web-app-to-azure)
  - [Deploy web app to localhost and use API on localhost](#deploy-web-app-to-localhost-and-use-api-on-localhost)
  - [Deploy web app to localhost and use API on Azure](#deploy-web-app-to-localhost-and-use-api-on-azure)
    - [Local dev server](#local-dev-server)
    - [Local preview](#local-preview)
    - [Expose local deployment on the internet (host)](#expose-local-deployment-on-the-internet-host)
  - [Configure CORS](#configure-cors)
    - [Configure CORS via backend code](#configure-cors-via-backend-code)
    - [Configure CORS via Azure portal](#configure-cors-via-azure-portal)
- [Appendix](#appendix)
  - [API backend deployment reference](#api-backend-deployment-reference)
  - [Web app fronted deployment reference](#web-app-fronted-deployment-reference)
  - [CORS reference](#cors-reference)

# Deployment

This document details how to deploy both web frontend and API backend, in various setups.

In this document `.` refers to the repository root.

The scenarios described here are:

- Deploy both the API backend and web app frontend to Azure.
- Deploy both the API backend and web app frontend to localhost.
- Deploy the API backend to Azure and the web app frontend to localhost.

# Deploy the API backend

The C# ASP.NET Core REST API backend sources are at [`./src`] with entry point project at [`./src/api`].

Once you deploy the API, you can explore its surface from the browser by appending `/swagger/index.html`
to the URL.

The deployment options described in this document have been setup as explained in [`api_backend_setup.md`].

## Deploy API to Azure

You can deploy the API backend to an Azure app [`game-api1`].

The deployment happens automatically on a push to `main` branch thanks to the GitHub Actions workflow [`api_CICD.yml`].
You can also deploy from your own branch by manually triggering the workflow via the [GH Actions runs] web UI.
You can read more about the manual trigger on the [`workflow_dispatch`] doc.

## Deploy API to localhost

### From Visual Studio

1. Open the `./src/game.sln` solution in Visual Studio
2. Select the `api` project
3. Select `Debug` -> `Start without Debugging`.

### From CLI

``` powershell
cd ./src
dotnet run --project api
```

# Deploy the web app frontend

The SolidJS web frontend sources are at [`./web`].  

> [!IMPORTANT]
> As the web frontend uses the API backend, you must ensure appropriate API backend is deployed first
> and its [CORS] is configured properly.
> See [#configure-cors](#configure-cors).

The deployment options described in this document have been setup as explained in [`web_frontend_setup.md`].

## Deploy web app to Azure

You can deploy the web frontend to an Azure static web app [`game-web`].

The deployment happens automatically on a push to `main` branch thanks to the GitHub Actions workflow [`web_CICD.yml`].
You can also deploy from your own branch by manually triggering the workflow via the [GH Actions runs] web UI.
You can read more about the manual trigger on the [`workflow_dispatch`] doc.

## Deploy web app to localhost and use API on localhost

Not yet implemented. I have notes on that in OneNote `How to do localhost`.

## Deploy web app to localhost and use API on Azure

There are two ways of doing it: local dev server, and local preview of prod deployment.

If you are curious about the differences between the local dev server and the local preview, see
[ChatGPT conversation: `vite` vs `vite preview`].

### Local dev server

To run the app locally as a local dev server, with hot module replacement (HMR) / hot reload for rapid development, run
the following from [`./web`]:

``` powershell
npm run dev
```

This will execute the [`vite`] command.

### Local preview

To run the app locally as a preview of how it will look on Azure, run the following form [`./web`]:

``` powershell
npm run build
npm run preview
```

This will first execute the `tsc && vite build` command and then [`vite preview`] command.

### Expose local deployment on the internet (host)

Both in case of [`vite`] and [`vite preview`] you can expose the local deployment on the internet with `-host`
but you have to be mindful of [this caveat][vite -host caveat] which mean you have to add `--` before `--host`:

`npm run dev -- --host`
or
`npm run preview -- --host`

## Configure CORS

The API backend at [`./src/api`] must have appropriately configured [CORS], so that web app frontend can call it,
be it from Azure, or localhost deployment.

> [!CAUTION]
> If you deploy the API backend on localhost, expose it to public internet, and allow in CORS access from localhost
> URLs, you will expose your personal computer to malicious attacks from all across the web.

### Configure CORS via backend code

Per [Enable Cross-Origin Requests (CORS) in ASP.NET Core],
specifically [Test CORS][Enable Cross-Origin Requests (CORS) in ASP.NET Core / Test CORS],
and [Add CORS functionality to REST API], you can add CORS policy via code.

For a confirmed example of this code setup working, see [commit c1b096f: add API CORS policy in code].

### Configure CORS via Azure portal

You can configure CORS on Azure portal, e.g. at [`game-api1` CORS page]. See [SO: CORS in Azure app service].

For an example working config, see [#cors-reference](#cors-reference).

The Azure portal configuration takes precedence over code. From [SO: CORS in Azure app service]:

> If you set CORS policy in both Code and in Azure Portal, then the setting of code
> will be overridden with the settings in Portal.

> [!NOTE]
> Azure Portal CORS page has some limitations, e.g. about wildcards, as explained in
> [this FAQ](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-rest-api#how-do-i-set-allowed-origins-to-a-wildcard-subdomain).

> [!TIP]
> Configuring CORS via Azure portal is especially useful for quick one-off tests, e.g. with localhost.

# Appendix

## API backend deployment reference

The documentation about API backend deployment is based primarily on following articles:

- [Tutorial: Create a minimal API with ASP.NET Core / Debug]
- [`dotnet run`]

## Web app fronted deployment reference

The documentation about web app frontend deployment is based primarily on following articles:

- [README of the used `create-vite` `solid-ts` template]
- [Vite doc on deploying a static site]
- [Vite doc on deploying to Azure static web apps]
- [Vite doc on testing the app locally]

## CORS reference

- [Enable Cross-Origin Requests (CORS) in ASP.NET Core]
- [Add CORS functionality to REST API]
- [SO: CORS in Azure app service]
- [General SO post about CORS errors](https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe)
- [CORS on Wikipedia](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
- [CORS on Mozilla Developer Network][CORS]
- [W3C CORS protocol spec](https://fetch.spec.whatwg.org/#http-cors-protocol)
- [ChatGPT conversation about CORS and `curl`](https://chat.openai.com/share/db060e16-3110-4ddb-b370-32682425907b)
- [SO explanation why CORS works for `curl`](https://stackoverflow.com/questions/38689350/for-what-reason-i-can-access-the-resources-by-curl-but-not-in-the-browser)
  - `curl` CORS handling is also mentioned
    [in Microsoft docs in "Test CORS"][Enable Cross-Origin Requests (CORS) in ASP.NET Core / Test CORS].
- Vite uses [npm cors package](https://www.npmjs.com/package/cors) per [this reference](https://github.com/vitejs/vite/blob/19e3c9a8a16847486fbad8a8cd48fc771b1538bb/packages/vite/package.json#L103).
  - I think this would be relevant only if the vite-powered server would receive calls, i.e. serve as API backend.
    This is corroborated by [this SO answer](https://stackoverflow.com/a/71755066/986533).
  - Additional [Vite CORS TSG](https://vitejs.dev/guide/troubleshooting#build).
- [CORS in localhost Chrome](https://stackoverflow.com/questions/10883211/why-does-my-http-localhost-cors-origin-not-work)

Example config for [`game-api1` CORS page]:

![game-api1 CORS page](game_api1_cors_page.png)

<!--
--------------------------------------------------------------------------------
references
--------------------------------------------------------------------------------
-->

[`./src/api`]: ../src/api
[`./src`]: ../src
[`./web`]: ../web
[`api_backend_setup.md`]: ./api_backend_setup.md
[`api_CICD.yml`]: ../.github/workflows/api_CICD.yml
[`dotnet run`]: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-run
[`game-api1`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/sites/game-api1/appServices
[`game-api1` CORS page]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourcegroups/game-rg/providers/Microsoft.Web/sites/game-api1/apiCors
[`game-web`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourceGroups/game-rg/providers/Microsoft.Web/staticSites/game-web/staticsite
[`vite preview`]: https://vitejs.dev/guide/cli.html#vite-preview
[`vite`]: https://vitejs.dev/guide/cli.html#vite
[`web_CICD.yml`]: ../.github/workflows/web_CICD.yml
[`web_frontend_setup.md`]: ./web_frontend_setup.md
[`workflow_dispatch`]: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
[Add CORS functionality to REST API]: https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-rest-api#add-cors-functionality
[ChatGPT conversation: `vite` vs `vite preview`]: https://chat.openai.com/c/8f51472c-e7a2-4d82-b660-36d990135ee9
[commit c1b096f: add API CORS policy in code]: https://github.com/konrad-jamrozik/game/commit/c1b096f69a96718eff6041ccf616ca9923777eed
[CORS]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[Enable Cross-Origin Requests (CORS) in ASP.NET Core]: https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0
[Enable Cross-Origin Requests (CORS) in ASP.NET Core / Test CORS]: https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0#test-cors
[GH Actions runs]: https://github.com/konrad-jamrozik/game/actions
[README of the used `create-vite` `solid-ts` template]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-solid-ts
[SO: CORS in Azure app service]: https://stackoverflow.com/questions/75702313/how-to-configure-cors-on-azure-app-service
[Tutorial: Create a minimal API with ASP.NET Core / Debug]: https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore?pivots=development-environment-vs&tabs=net70#1-create-an-aspnet-web-app
[vite -host caveat]: https://github.com/vitejs/vite/discussions/3396#discussioncomment-4581934
[Vite doc on deploying a static site]: https://vitejs.dev/guide/static-deploy.html
[Vite doc on deploying to Azure static web apps]: https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps
[Vite doc on testing the app locally]: https://vitejs.dev/guide/static-deploy.html#testing-the-app-locally
