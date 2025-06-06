export async function safeParseResponse(response: Response) {
  const text = await response.text()

  try {
    return {
      success: true,
      data: JSON.parse(text),
      text,
      status: response.status,
      ok: response.ok,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      text,
      status: response.status,
      ok: response.ok,
      parseError: error.message,
    }
  }
}

export function createApiError(message: string, status = 500) {
  const error = new Error(message)
  error.name = "ApiError"
  ;(error as any).status = status
  return error
}
