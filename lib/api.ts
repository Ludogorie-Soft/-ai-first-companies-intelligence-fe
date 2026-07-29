import type { AdminUser, AuthResult, Batch, DiscoveryCandidate, EmailTemplate, PaginatedAuditLog, PaginatedCompanies, PersonaSearchResult, TenantProfile, UploadResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function setUserEmail(email: string): void {
  localStorage.setItem('userEmail', email);
}

export function clearAuth(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
}

export function getUserRole(): string {
  if (typeof window === 'undefined') return 'USER';
  const token = localStorage.getItem('token');
  if (!token) return 'USER';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.role as string) || 'USER';
  } catch {
    return 'USER';
  }
}

export function getUserEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userEmail') || '';
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isForm?: boolean,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  if (res.status === 401) {
    // Only redirect when a session token existed — means it expired.
    // During login/register there is no token, so 401 = bad credentials;
    // let the error propagate to the form so the user sees the message.
    if (getToken()) {
      clearAuth();
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const d = await res.json();
      msg = d.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return res as unknown as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>('POST', '/auth/login', { email, password }),

  register: (
    email: string,
    password: string,
    tenantName: string,
    extra?: {
      website?: string;
      contactPersonName?: string;
      contactPersonTitle?: string;
      contactPersonPhone?: string;
    },
  ) =>
    request<AuthResult>('POST', '/auth/register', { email, password, tenantName, ...extra }),

  listBatches: () => request<Batch[]>('GET', '/batches'),

  getBatch: (id: string) => request<Batch>('GET', `/batches/${id}`),

  getCompanies: (batchId: string, page: number = 1) =>
    request<PaginatedCompanies>('GET', `/batches/${batchId}/companies?page=${page}&limit=50`),

  uploadBatch: (formData: FormData, forceRecrawl: boolean, templateId?: string) => {
    if (templateId) formData.append('templateId', templateId);
    return request<UploadResult>(
      'POST',
      `/batches/upload${forceRecrawl ? '?force_recrawl=true' : ''}`,
      formData,
      true,
    );
  },

  downloadBatch: (id: string, format: 'csv' | 'xlsx') =>
    request<Response>('GET', `/batches/${id}/download?format=${format}`),

  deleteBatch: (id: string) => request<void>('DELETE', `/batches/${id}`),

  reEnrichBatch: (id: string) =>
    request<{ batchId: string; reEnqueuedCompanies: number; status: string }>('POST', `/batches/${id}/re-enrich`),

  createPersonaSearch: (params: {
    persona: string;
    location: string;
    keywords?: string;
    maxResults?: number;
    templateId?: string;
  }) => request<PersonaSearchResult>('POST', '/persona-searches', params),

  getCandidates: (batchId: string) =>
    request<DiscoveryCandidate[]>('GET', `/batches/${batchId}/candidates`),

  updateCandidate: (batchId: string, domain: string, action: 'exclude' | 'include') =>
    request<{ ok: boolean; crawlTriggered?: boolean }>(
      'PATCH',
      `/batches/${batchId}/candidates/${encodeURIComponent(domain)}`,
      { action },
    ),

  getTenantProfile: () =>
    request<TenantProfile>('GET', '/tenant/profile'),

  updateTenantProfile: (data: Partial<TenantProfile>) =>
    request<TenantProfile>('PUT', '/tenant/profile', data),

  listTemplates: () =>
    request<EmailTemplate[]>('GET', '/templates'),

  createTemplate: (data: { name: string; subject: string; body: string; isDefault?: boolean }) =>
    request<EmailTemplate>('POST', '/templates', data),

  updateTemplate: (id: string, data: { name?: string; subject?: string; body?: string; isDefault?: boolean }) =>
    request<EmailTemplate>('PUT', `/templates/${id}`, data),

  deleteTemplate: (id: string) =>
    request<void>('DELETE', `/templates/${id}`),

  setDefaultTemplate: (id: string) =>
    request<EmailTemplate>('PUT', `/templates/${id}/default`, {}),

  listAdminUsers: () =>
    request<AdminUser[]>('GET', '/admin/users'),

  updateAdminUser: (id: string, data: { role?: 'USER' | 'ADMIN'; monthlyDomainLimit?: number | null }) =>
    request<{ id: string; email: string; role: string; monthlyDomainLimit: number | null }>(
      'PATCH',
      `/admin/users/${id}`,
      data,
    ),

  getAuditLog: (params: {
    page?: number;
    limit?: number;
    adminEmail?: string;
    targetEmail?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    order?: 'asc' | 'desc';
  } = {}) => {
    const q = new URLSearchParams();
    (Object.entries(params) as [string, string | number | undefined][]).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return request<PaginatedAuditLog>('GET', `/admin/audit-log${qs ? `?${qs}` : ''}`);
  },

};
