# Debugging

## How to debug localhost Vite dev server in Chrome browser

Once dev server is running with `npm run dev`, you can use Chrome DevTools to open the sources and set breakpoints.
The sources should be mapped to original TypeScript source files.

See also https://react.dev/learn/react-developer-tools

## How to debug localhost Vite dev server in VS Code

1. From VS Code, using `Run and Debug` tab, create `launch.json` at `game\.vscode\launch.json`
2. Adapt its contents to say:
    ``` jsonc
    {
        // Use IntelliSense to learn about possible attributes.
        // Hover to view descriptions of existing attributes.
        // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
        "version": "0.2.0",
        "configurations": [
            {
                "type": "chrome",
                "request": "launch",
                "name": "Debug Vite",
                "url": "http://localhost:5173",
                "webRoot": "${workspaceFolder}/web"
            },
        ]
    }
    ```
3. Add a breakpoint within VSCode source
4. Run the frontend: `npm run dev`
5. In VSCode `Run and Debug` tab, select the configuration and launch it.
6. Observe the breakpoint getting hit and observe the `Debug console` contents.

## How to debug vitest tests in VS Code

In VSCode:

1. `Vitest: Show Output Channel`
2. `Run test` (right arrow icon) on the test file you want to debug.
   This will cause it load specific tests once the run is done.
3. `Debug tes` (right arrow with bug icon) on the test line you want to debug.

## Doc reference

- Explanation of VS Code launch configurations:  
  https://code.visualstudio.com/docs/editor/debugging#_launch-versus-attach-configurations
- Step by step guide with some obsolete values like port 3000:  
  https://github.com/vitejs/vite/discussions/4065#discussioncomment-1359932
- `webRoot` explained:  
  https://stackoverflow.com/questions/52377756/what-is-webroot-in-the-vscode-chrome-debugger-launch-launch-config
- `${workspaceFolder}` explained:  
  https://code.visualstudio.com/docs/editor/variables-reference
- Vitest article on debugging  
  https://vitest.dev/guide/debugging.html
