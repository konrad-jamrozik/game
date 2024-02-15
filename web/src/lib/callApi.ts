/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash'
import { log } from './api'

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

export async function callApi<T>(
  params: CallApiParams,
): Promise<T | undefined> {
  params.setLoading(true)
  params.setError('')

  try {
    console.log(`callApi(). request: ${await log(params.request)}`)

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
  }
}

export type CallApiParams = FetchCallbacks & {
  readonly request: Request
}

export type FetchCallbacks = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | undefined>>
}

function getHost(): string {
  return import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'
}
