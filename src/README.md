# About the API backend

This directory contains the C# ASP.NET Core REST API backend sources.

The entry point project is [`./api`].

This backend contains:

- The core game engine logic.
- An API interface to the engine, consumed by the web UI frontend whose sources are located at [`../web`].
- CLI interface to the engine.

If you want to learn how this project was initially set up, consult [`../docs/api_backend_setup.md`].

## Develop

This project is to be developed using Visual Studio. The solution file is [`./game.sln`].

If you want to make global edits modifying both the backend and the frontend,
use VS Code and the workspace file of [`../game.code_workspace`].

## Build & Deploy

To build & deploy, whether for local dev with HR (Hot Reload) or to Azure,
consult [`../docs/deployment.md`].

[`../docs/api_backend_setup.md`]: ../docs/api_backend_setup.md
[`../docs/deployment.md`]: ../docs/deployment.md
[`../game.code_workspace`]: ../game.code_workspace
[`../web`]: ./web
[`./api`]: ./api
[`./game.sln`]: ../game.sln
