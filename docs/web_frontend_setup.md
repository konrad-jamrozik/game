# How the `SolidJS` web frontend project was set up

In this document `.` refers to the repository root.

The [`./web`] directory contains the web frontend of the game.
I chose the following key technologies to implement the web frontend:

`SolidJS`, `TypeScript`, `tailwindcss`, `tw-elements`, `Azure Static Web Apps`

As a result of choosing the above, I also ended up using following technologies:

`npm`, `node.js`, `nvm-windows`, `vite`, `GitHub Actions`

I chose `SolidJS` as a popular and better React, based on the [2022 state-of-js frontend frameworks report].  
I chose `tailwindcss` based on the [tailwindcss css utility classes blog post] and related articles:

- https://johnpolacek.github.io/the-case-for-atomic-css/
- https://tailwindcss.com/docs/utility-first
- https://tailwindcss.com/

## Initial web frontend setup commands executed

At a high-level, to setup the [`./web`] frontend project, I executed the following steps:

1. Install `npm` and `node.js` using `nvm-windows`
2. Create `SolidJS` + `TypeScript` project scaffolding by using `npm` and `create-vite`
3. Install `tailwindcss`
4. Configure `GitHub Actions` workflow to deploy to `Azure Static Web Apps` app
5. Install `tw-elements`

### Step 1: install `npm` and `node.js` using `nvm-windows`

Follow the article [Using a Node version manager to install Node.js and npm] and use [`nvm-windows`] to
install latest `npm` and `node.js`:

1. Download the `nvm-setup.exe` from the latest `nvm-windows` release from https://github.com/coreybutler/nvm-windows/releases
2. Install `nvm-setup.exe`
3. ``` powershell
   # As of 12/21/2023:
   nvm current
   nvm list
   nvm install latest
   nvm use 21.5.0
   nvm current
   node -v # v21.5.0
   npm -v # 10.2.4
   ```

> [!NOTE]
>
> - `npm` releases are at https://github.com/npm/cli/releases
>   - The doc mentions the latest version at https://docs.npmjs.com/about-npm-versions#the-latest-release-of-npm
> - `node.js` releases are at https://nodejs.org/en

### Step 2: Create `SolidJS` + `TypeScript` project scaffolding by using `npm` and `create-vite`

Initially I chose `SolidJS` setup approach via [SolidJS / Getting Started / Try Solid][Try Solid].

Follow the instructions given in the [Scaffolding Your First Vite Project] article for `solid-ts` template
of [create-vite npm] package ([src][create-vite src]). Specifically, run the variant for
`SolidJS` and `TypeScript` ([src][create-vite solid-ts]):

``` powershell
npm create vite@latest web -- --template solid-ts
cd web
npm install
npm run dev # To locally verify that things work
# git add, commit and push
```

I have originally executed these steps in [commit 2a2d6cf][commit 2a2d6cf: initial frontend].
Note at that time I used `frontend` dir instead of `web`.

> [!NOTE]
>
> `npm create`, as [explained on StackOverflow][npm create SO], is an alias for [`npm init`].

> [!NOTE]
> There are also other sets of templates linked from the `SolidJS` docs which would be an alternative approach:
>
> - https://www.solidjs.com/guides/getting-started#try-solid
> - https://docs.solidjs.com/guides/tutorials/getting-started-with-solid/installing-solid
> - https://github.com/solidjs/templates
> - https://github.com/solidjs/templates/tree/main/ts
> - https://github.com/solidjs/templates/tree/main/ts-tailwindcss

### Step 3: Install `tailwindcss`

Follow the article [Install Tailwind CSS with SolidJS]. There is another article with almost identical steps:
[Install Tailwind CSS with Vite].

``` powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# git add, commit and push 
```

You can see the result of the above in [commit b429583: add tailwindcss].

Now follow steps 3 to 6 from [Install Tailwind CSS with SolidJS] to do file edits to [`tailwind.config.js`]
and other relevant files and push to repo.

You can see the result of it in [commit baf3e5f: configure tailwindcss].

### Step 4: Configure `GitHub Actions` workflow to deploy to `Azure Static Web Apps` app

Follow [Vite / Deploying a Static Site / Azure Static Web Apps] and use [Build configuration for Azure Static Web Apps]
as a reference to deploy GitHub Actions workflow file for the [`./web`] CI/CD.

Done in [commit ef8a4a8: add Azure Static Web Apps GH Actions workflow file].

For more, see [How the web fronted GitHub Actions workflow was created](#how-the-web-fronted-github-actions-workflow-was-created).

### Step 5: Install `tw-elements`

Follow the relevant steps from the [tw-elements SolidJS integration] article.

Specifically, follow these steps from the article:

- Installing and configuring Tailwind CSS and TW Elements
  - Step 2 / Add the paths to all of your template files in your `tailwind.config.js` file.
  - Step 4 / Install TW elements: `npm install tw-elements`
  - Step 5 / Import components which are you intend to use and necessary function initTE.
    Initialize initTE in a lifecycle method.
- Initializing via JS:
  - Step 1 / Import components which are you intend to use.

The above was done in [commit 7ab4b29: setup tw-elements].

> [!NOTE]
> After I installed `tw-elements` I ran into two issues that I had to debug and fix:
>
> - The dark mode was not rendering correctly due to extra `darkMode: "class",` in [tw-elements SolidJS integration].
>   Fixed with [commit e348667: fix tw-elements dark mode in tailwind.config.js].
>
> - The calendar button padding was wrong due to styling rules in [create-vite solid-ts / src / index.css].
>   Fixed with [commit c7527a9: fix tw-elements button padding in index.css].
>
> - More details in my personal OneNote in `Debugging tw-elements Date Picker rendering issues: dark theme and alignment`.

## How the web fronted GitHub Actions workflow was created

The frontend web deployment configuration is a GitHub actions workflow [`.github/workflows/web_CICD.yml`].

That workflow was initially created (see [git history](https://github.com/konrad-jamrozik/game/commits/main/.github/workflows/web_CICD.yml))
by following these instructions:

- [Vite / Deploying a Static Site / Azure Static Web Apps]
- [Build configuration for Azure Static Web Apps]

Specifically, I used the [Azure Static Web Apps VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)
wizard to configure the deployment, per `Vite / Deploying a Static Site / Azure Static Web Apps`:
> Follow the wizard started by the extension to give your app a name, choose a framework preset,
> and designate the app root (usually /) and built file location /dist. The wizard will run and will
> create a GitHub action in your repo in a .github folder.

This created the GitHub actions workflow, which looks like the [Build configuration here](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#build-configuration).

<!--
--------------------------------------------------------------------------------
references
--------------------------------------------------------------------------------
-->

[2022 state-of-js frontend frameworks report]: https://2022.stateofjs.com/en-US/libraries/front-end-frameworks/
[Build configuration for Azure Static Web Apps]: https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions
[Install Tailwind CSS with SolidJS]: https://tailwindcss.com/docs/guides/solidjs
[Install Tailwind CSS with Vite]: https://tailwindcss.com/docs/guides/vite
[Scaffolding Your First Vite Project]: https://vitejs.dev/guide/#scaffolding-your-first-vite-project
[Try Solid]: https://www.solidjs.com/guides/getting-started#try-solid
[Using a Node version manager to install Node.js and npm]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm
[Vite / Deploying a Static Site / Azure Static Web Apps]: https://vitejs.dev/guide/static-deploy.html#azure-static-web-apps
[`./web`]: ../web
[`.github/workflows/web_CICD.yml`]: ../.github/workflows/web_CICD.yml
[`npm init`]: https://docs.npmjs.com/cli/v10/commands/npm-init
[`nvm-windows`]: https://github.com/coreybutler/nvm-windows
[`tailwind.config.js`]: ../web/tailwind.config.js
[commit 2a2d6cf: initial frontend]: https://github.com/konrad-jamrozik/game/commit/2a2d6cf983a64732da48cfb36131b9d4bd05ed51
[commit 7ab4b29: setup tw-elements]: https://github.com/konrad-jamrozik/game/commit/7ab4b292817bb071c4ff943c1168fe65c4c5bdf3
[commit b429583: add tailwindcss]: https://github.com/konrad-jamrozik/game/commit/b429583cb5f422992bc0321b90c7753d5f22ab6e
[commit baf3e5f: configure tailwindcss]: https://github.com/konrad-jamrozik/game/commit/baf3e5f7c99869fd81af07ec64b8b967b01b5133
[commit c7527a9: fix tw-elements button padding in index.css]: https://github.com/konrad-jamrozik/game/commit/c7527a987f61166969324d1054d289d53a1cccfe
[commit e348667: fix tw-elements dark mode in tailwind.config.js]: https://github.com/konrad-jamrozik/game/commit/e34866742d4ca146249de2403bbbc4b1e5423c7f
[commit ef8a4a8: add Azure Static Web Apps GH Actions workflow file]: https://github.com/konrad-jamrozik/game/commit/ef8a4a8276bc204371c0ef276f1183b0694919c1
[create-vite npm]: https://www.npmjs.com/package/create-vite
[create-vite solid-ts / src / index.css]: https://github.com/vitejs/vite/blob/main/packages/create-vite/template-solid-ts/src/index.css
[create-vite solid-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-solid-ts
[create-vite src]: https://github.com/vitejs/vite/tree/main/packages/create-vite
[npm create SO]: https://stackoverflow.com/questions/57133219/what-is-the-npm-create-command
[tailwindcss css utility classes blog post]: https://adamwathan.me/css-utility-classes-and-separation-of-concerns/
[tw-elements SolidJS integration]: https://tw-elements.com/docs/standard/integrations/solid-integration/
