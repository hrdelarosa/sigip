import { env } from '../env'
import { ApiError, type ApiErrorResponse } from './api-error'

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw await createApiError(response)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

async function createApiError(response: Response): Promise<ApiError> {
  const details = await readErrorResponse(response)

  return new ApiError(
    response.status,
    getErrorMessage(details, response.status),
    details,
  )
}

async function readErrorResponse(
  response: Response,
): Promise<ApiErrorResponse | undefined> {
  try {
    return (await response.json()) as ApiErrorResponse
  } catch {
    return undefined
  }
}

function getErrorMessage(
  details: ApiErrorResponse | undefined,
  status: number,
): string {
  if (Array.isArray(details?.message)) {
    return details.message.join(', ')
  }

  if (typeof details?.message === 'string') {
    return details.message
  }

  switch (status) {
    case 400:
      return 'La solicitud no es válida'

    case 404:
      return 'El recurso solicitado no existe'

    case 409:
      return 'La operación entra en conflicto con los datos existentes'

    case 500:
      return 'Ocurrió un error interno del servidor'

    default:
      return 'Ocurrió un error al comunicarse con el servidor'
  }
}
