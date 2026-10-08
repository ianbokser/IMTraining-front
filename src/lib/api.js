// Cliente HTTP centralizado. Todo pega al backend real.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006'

// Token guardado por AuthContext, para las rutas protegidas.
function authHeader() {
  try {
    const raw = localStorage.getItem('imtraining_auth')
    const token = raw ? JSON.parse(raw).token : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const data = await res.json()
      msg = data.error || msg
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(msg || `Error ${res.status}`)
  }
  return res.json()
}

// Subida multipart (archivos): NO seteamos Content-Type para que el browser ponga el boundary.
async function upload(path, formData) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: formData,
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      msg = (await res.json()).error || msg
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(msg || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  // --- Contenido público ---
  getExampleRoutine() {
    return request('/api/routines/example')
  },

  getPlans() {
    return request('/api/plans')
  },

  // --- Pedidos ---
  createOrder(payload) {
    return request('/api/orders', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(payload),
    })
  },

  getOrders() {
    return request('/api/orders', { headers: authHeader() })
  },

  // --- Pagos ---
  payOrder(orderId) {
    return request(`/api/orders/${orderId}/pay`, { method: 'POST' })
  },

  getPaymentProviders() {
    return request('/api/payments/providers')
  },

  checkout(orderId, provider = 'simulado') {
    return request(`/api/orders/${orderId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    })
  },

  getOrderStatus(orderId) {
    return request(`/api/orders/${orderId}/status`)
  },

  orderPdfUrl(orderId) {
    return `${API_URL}/api/orders/${orderId}/pdf`
  },

  // --- Auth ---
  register({ email, nombre, telefono, password }) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, nombre, telefono, password }),
    })
  },

  login(email, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  me() {
    return request('/api/auth/me', { headers: authHeader() })
  },

  // --- Cliente: mis rutinas ---
  getMyOrders() {
    return request('/api/orders/mine', { headers: authHeader() })
  },

  getOrderRoutine(orderId) {
    return request(`/api/orders/${orderId}/routine`, { headers: authHeader() })
  },

  // Progreso de peso: { [routineExerciseId]: [{ semana, peso }, ...] }
  getExerciseLogs(orderId) {
    return request(`/api/orders/${orderId}/routine/logs`, { headers: authHeader() })
  },

  logExerciseWeight(orderId, { routineExerciseId, semana, peso }) {
    return request(`/api/orders/${orderId}/routine/logs`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ routineExerciseId, semana, peso }),
    })
  },

  // --- Admin ---
  getUsers() {
    return request('/api/users', { headers: authHeader() })
  },

  // Biblioteca de ejercicios
  adminListExercises() {
    return request('/api/admin/exercises', { headers: authHeader() })
  },

  adminCreateExercise(payload) {
    return request('/api/admin/exercises', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(payload),
    })
  },

  adminUpdateExercise(id, payload) {
    return request(`/api/admin/exercises/${id}`, {
      method: 'PATCH',
      headers: authHeader(),
      body: JSON.stringify(payload),
    })
  },

  adminDeleteExercise(id) {
    return request(`/api/admin/exercises/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    })
  },

  // Sube un video a Bunny y devuelve { videoId, embedUrl, thumbnailUrl }
  adminUploadVideo(file, title) {
    const fd = new FormData()
    fd.append('file', file)
    if (title) fd.append('title', title)
    return upload('/api/admin/videos', fd)
  },

  // URL de la plantilla Excel de ejemplo (descarga directa, sin auth).
  excelTemplateUrl() {
    return `${API_URL}/api/routines/template-excel`
  },

  // Rutinas
  adminParseExcel(file) {
    const fd = new FormData()
    fd.append('file', file)
    return upload('/api/admin/routines/parse-excel', fd)
  },

  adminCreateRoutine(payload) {
    return request('/api/admin/routines', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(payload),
    })
  },
}
