// lib/apiClient.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiClient(endpoint, customOptions = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Extract body and headers to prevent customOptions from overriding them
  const { body: rawBody, headers: customHeaders, method: customMethod, ...restOptions } = customOptions;

  // Safely stringify object payloads
  let body = rawBody;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  // Determine method: if body exists and no method was specified, default to POST
  const method = customMethod || (body ? 'POST' : 'GET');

  const response = await fetch(url, {
    method,
    credentials: 'include',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...(body ? { body } : {}), // Only include body property if body exists
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof data === 'object' && (data?.message || data?.error)) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}