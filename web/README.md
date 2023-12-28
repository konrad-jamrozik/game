# About the web app frontend

This directory contains the SolidJS web app frontend sources.

This app provides web UI frontend to the game engine.

To access the game engine the frontend calls the API backend whose code is located in [`../src`].

If you want to learn how this project was initially set up, consult [`../docs/web_frontend_setup.md`].

## Develop

This project is to be developed using VS Code. The workspace file is [`../game.code_workspace`].

> [!NOTE]
> The VS Code workspace file also encompassed the sources of the backend to enable you to do global edits and view
> both frontend and backend together. However, to edit backend code, consult [`../src/README.md`].

## Build & Deploy

To build & deploy, whether for local dev with HMR (Hot Module Reload) or to Azure,
consult [`../docs/deployment.md`].

[`../docs/deployment.md`]: ../docs/deployment.md
[`../docs/web_frontend_setup.md`]: ../docs/web_frontend_setup.md
[`../game.code_workspace`]: ../game.code_workspace
[`../src/README.md`]: ../src/README.md
[`../src`]: ../src
