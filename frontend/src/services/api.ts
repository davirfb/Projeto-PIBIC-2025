const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

let _token: string | null = localStorage.getItem("token")

export function setToken(token: string | null) {
  _token = token
  if (token) localStorage.setItem("token", token)
  else localStorage.removeItem("token")
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (_token) h["Authorization"] = `Bearer ${_token}`
  return h
}

async function handle(res: Response) {
  if (res.status === 204) return null
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.detail ?? `HTTP ${res.status}`)
  return body
}

export const api = {
  login: async (email: string, senha: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password: senha }),
    })
    return handle(res)
  },

  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: authHeaders() })
    return handle(res)
  },

  post: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handle(res)
  },

  patch: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handle(res)
  },

  put: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handle(res)
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    return handle(res)
  },
}
