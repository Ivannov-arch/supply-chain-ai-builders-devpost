// Typed fetch functions for all backend endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function predict(data: object) {
  const res = await fetch(${API_URL}/predict, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function predictBulk(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(${API_URL}/predict-bulk, { method: 'POST', body: form })
  return res.json()
}

export async function submitFeedback(data: object) {
  const res = await fetch(${API_URL}/feedback, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
