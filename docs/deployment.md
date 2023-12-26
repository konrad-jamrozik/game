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
- [Appendix](#appendix)
  - [API backend deployment reference](#api-backend-deployment-reference)
  - [Web app fronted deployment reference](#web-app-fronted-deployment-reference)

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
dotnet run --project api --launch-profile https
```

# Deploy the web app frontend

The SolidJS web frontend sources are at [`./web`].  

> [!IMPORTANT]
> As the web frontend uses the API backend, you must ensure appropriate API backend is deployed first
> and its [CORS] is configured properly.
> See [`cors.md`](./cors.md).

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
[`game-web`]: https://portal.azure.com/#@spawarottijamro.onmicrosoft.com/resource/subscriptions/8695c84c-09a4-4b50-994f-a2fa7f36cc92/resourceGroups/game-rg/providers/Microsoft.Web/staticSites/game-web/staticsite
[`vite preview`]: https://vitejs.dev/guide/cli.html#vite-preview
[`vite`]: https://vitejs.dev/guide/cli.html#vite
[`web_CICD.yml`]: ../.github/workflows/web_CICD.yml
[`web_frontend_setup.md`]: ./web_frontend_setup.md
[`workflow_dispatch`]: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
[ChatGPT conversation: `vite` vs `vite preview`]: https://chat.openai.com/c/8f51472c-e7a2-4d82-b660-36d990135ee9
[CORS]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[GH Actions runs]: https://github.com/konrad-jamrozik/game/actions
[README of the used `create-vite` `solid-ts` template]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-solid-ts
[Tutorial: Create a minimal API with ASP.NET Core / Debug]: https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore?pivots=development-environment-vs&tabs=net70#1-create-an-aspnet-web-app
[vite -host caveat]: https://github.com/vitejs/vite/discussions/3396#discussioncomment-4581934
[Vite doc on deploying a static site]: https://vitejs.dev/guide/static-deploy.html
[Vite doc on deploying to Azure static web apps]: https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps
[Vite doc on testing the app locally]: https://vitejs.dev/guide/static-deploy.html#testing-the-app-locally
