
import { QueryClient } from '@tanstack/react-query';

// API базовый URL
const API_BASE_URL = '/api';

// Функция для выполнения API запросов
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Ошибка соединения с сервером',
    }));
    throw new Error(error.message || `HTTP ошибка! статус: ${response.status}`);
  }
  
  // Для пустых ответов (например, 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// Настройка QueryClient для React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 1,
    },
  },
});

// API эндпоинты
export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      fetchAPI('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () => fetchAPI('/logout', { method: 'POST' }),
    getCurrentUser: () => fetchAPI('/user'),
  },
  projects: {
    getAll: () => fetchAPI('/projects'),
    getById: (id: number) => fetchAPI(`/projects/${id}`),
    create: (data: any) =>
      fetchAPI('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      fetchAPI(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  dashboard: {
    getStats: () => fetchAPI('/dashboard/stats'),
    getActivities: () => fetchAPI('/activities'),
    getCompliance: (projectId: number) => fetchAPI(`/compliance/${projectId}`),
  },
  analytics: {
    getSummary: () => fetchAPI('/analytics/summary'),
    getTimeline: (monthsCount: number) => 
      fetchAPI(`/activities/timeline/${monthsCount}`),
  },
};
