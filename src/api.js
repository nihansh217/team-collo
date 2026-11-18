const TOKEN_KEY = 'teamcollo-access-token';

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (!token) {
    clearToken();
    return;
  }
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing or disabled storage */
  }
}

function formatApiDetail(detail) {
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        const location = Array.isArray(item.loc)
          ? item.loc.filter((part) => part !== 'body').join(' ')
          : '';
        const message = item.msg || item.message || '';
        return [location, message].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join(' ');
  }
  if (typeof detail === 'object') {
    return detail.msg || detail.message || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text();
  return text || null;
}

export async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const token = getToken();
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    if (!token) {
      throw new ApiError('Not authenticated', 401);
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'Unable to reach the Team COLLO API. Confirm the backend is running.',
      0,
    );
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
    }
    throw new ApiError(
      formatApiDetail(payload?.detail) || `Request failed (${response.status})`,
      response.status,
      payload,
    );
  }

  return payload;
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function getMe() {
  return request('/auth/me', { auth: true });
}
// ==========================================
// PROJECT API FUNCTIONS
// ==========================================

export function getProjects() {
  return request('/projects', {
    auth: true,
  });
}

export function createProject(payload) {
  return request('/projects', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getProject(projectId) {
  return request(`/projects/${projectId}`, {
    auth: true,
  });
}

export function updateProject(projectId, payload) {
  return request(`/projects/${projectId}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteProject(projectId) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE',
    auth: true,
  });
}
// ==========================================
// TASK API FUNCTIONS
// ==========================================

export function getTasks(projectId) {
  return request(
    `/tasks/?project_id=${encodeURIComponent(projectId)}`,
    {
      auth: true,
    }
  );
}
export function getUsers() {
  return request('/users/', {
    auth: true,
  });
}
export function createTask(payload) {
  return request('/tasks/', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateTask(taskId, payload) {
  return request(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
    auth: true,
  });
}