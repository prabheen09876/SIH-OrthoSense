export type XrayPrediction = {
  filename: string
  predicted_class: number
  confidence: number
  class_details: {
    name: string
    badge: string
    severity: string
    description: string
    recommendation: string
  }
  class_distribution: Record<string, number>
  threshold_probabilities: number[]
  image_size: string
  disclaimer: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function predictXray(file: File): Promise<XrayPrediction> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/predict`, { method: 'POST', body: formData })
  } catch {
    throw new ApiError('Could not reach the analysis service. Confirm the backend is running.')
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new ApiError(detail?.detail ?? `Analysis failed (${response.status}).`, response.status)
  }

  return response.json() as Promise<XrayPrediction>
}
