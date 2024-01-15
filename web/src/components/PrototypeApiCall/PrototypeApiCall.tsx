export interface PrototypeApiCallProps {
  readonly prop?: string
}

export function PrototypeApiCall({
  prop = 'default value',
}: PrototypeApiCallProps): JSX.Element {
  /*
   * Read about this here:
   * https://vitejs.dev/guide/env-and-mode.html#env-variables
   * https://vitejs.dev/guide/env-and-mode.html#modes
   * https://vitejs.dev/guide/env-and-mode.html#node-env-and-modes
   * ChatGPT: Load Vite Config by Mode
   * https://chat.openai.com/share/9109f0a2-3f55-47ca-88c8-14d13c6acee5
   */
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const turnLimit = 1

  const queryString = `?turnLimit=${turnLimit}`

  const apiUrl = `${apiHost}/simulateGameSession${queryString}`

  return (
    <div>
      PrototypeApiCall {prop} {apiUrl}
    </div>
  )
}

