import _ from 'lodash'

export function getGetRequest(apiUrl: URL): Request {
  return new Request(apiUrl.toString(), {
    method: 'GET',
  })
}

export function getPostJsonRequest(apiUrl: URL, jsonBody: string): Request {
  return new Request(apiUrl.toString(), {
    method: 'POST',
    body: jsonBody,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function getApiUrl(path: string, query: string): URL {
  const queryString = query ? `?${query}` : ''
  return new URL(`${getHost()}/${path}${queryString}`)
}

export type CallApiParams = FetchCallbacks & {
  readonly request: Request
}

export async function callApi<T>(
  params: CallApiParams,
): Promise<T | undefined> {
  params.setLoading(true)
  params.setError(undefined)

  const logRequest: string = await log(params.request)
  try {
    console.log(`callApi() TRY: ${logRequest}`)

    const response: Response = await fetch(params.request)
    if (!response.ok) {
      const errorContents = await response.text()
      throw new Error(errorContents)
    }
    return (await response.json()) as T
  } catch (fetchError: unknown) {
    params.setError((fetchError as Error).message)
    console.error(fetchError)
    return undefined
  } finally {
    params.setLoading(false)
    console.log(`callApi() FINALLY: ${logRequest}`)
  }
}

export type FetchCallbacks = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | undefined>>
}

// Get backend API host
export function getHost(): string {
  // future work: this should probably be done using environment files:
  // - https://vitejs.dev/guide/env-and-mode.html#env-variables
  // - https://vitest.dev/advanced/api.html#mode
  //
  // The process.env['GITHUB_ACTIONS'] is defined in:
  // - https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
  //
  // For 'vitest' command the values appear to be:
  //
  //   import.meta.env.PROD: false, import.meta.env.MODE: test, process.env.NODE_ENV: test
  //
  return import.meta.env.PROD || import.meta.env['GITHUB_ACTIONS'] === 'true'
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'
}

export async function log(req: Request, pretty?: boolean): Promise<string> {
  const reqClone = req.clone()
  const body = await reqClone.text()
  const { url, method } = reqClone

  if (pretty ?? false) {
    // JSON.parse here is to avoid escaping of quotes. See
    // https://chat.openai.com/share/d6abd2a4-0265-4ea2-8bbb-f30eeee0f787
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(body)
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    parsed.url = url
    parsed.method = method
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    const stringified = JSON.stringify(parsed, undefined, 2)
    return stringified
  }
  return `${method} ${url} ${_.truncate(body, { length: 200 })}`
}
