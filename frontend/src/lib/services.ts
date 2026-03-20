import api from './api';
import type {
  AuthResponse, User, Incident, IncidentType, IncidentStatus,
  Vehicle, DashboardSnapshot, PeakHourData, RegionStat,
  SlaReport, HeatmapPoint, Responder, CallSession,
  ApiResponse, PaginatedResponse, NearbyIncident,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/profile'),

  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
    api.put<ApiResponse<User>>('/auth/profile', data),

  listUsers: (page = 1, limit = 20) =>
    api.get<ApiResponse<PaginatedResponse<User>>>(`/auth/users?page=${page}&limit=${limit}`),
};

// ─── Incidents ────────────────────────────────────────────────────────────────
export const incidentApi = {
  create: (data: {
    citizenName: string; citizenPhone?: string; incidentType: IncidentType;
    latitude: number; longitude: number; address?: string; notes?: string; priority?: number;
  }) => api.post<ApiResponse<Incident>>('/incidents', data),

  list: (params: { page?: number; limit?: number; status?: IncidentStatus; type?: IncidentType }) =>
    api.get<ApiResponse<PaginatedResponse<Incident>>>('/incidents', { params }),

  getOpen: () =>
    api.get<ApiResponse<Incident[]>>('/incidents/open'),

  getById: (id: string) =>
    api.get<ApiResponse<Incident>>(`/incidents/${id}`),

  updateStatus: (id: string, status: IncidentStatus, note?: string) =>
    api.put<ApiResponse<Incident>>(`/incidents/${id}/status`, { status, note }),

  assign: (id: string, responderId: string) =>
    api.put<ApiResponse<Incident>>(`/incidents/${id}/assign`, { responderId }),

  getNearby: (lat: number, lng: number, radius = 200) =>
    api.get<ApiResponse<NearbyIncident[]>>(`/incidents/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  linkReport: (data: { parentIncidentId: string; citizenName: string; citizenPhone?: string; notes?: string }) =>
    api.post<ApiResponse<unknown>>('/incidents/link', data),

  getLinkedReports: (id: string) =>
    api.get<ApiResponse<unknown[]>>(`/incidents/${id}/linked-reports`),
};

// ─── Responders ───────────────────────────────────────────────────────────────
export const responderApi = {
  list: (type?: string) =>
    api.get<ApiResponse<Responder[]>>('/responders', { params: type ? { type } : {} }),

  create: (data: {
    name: string; type: string; stationName: string;
    latitude: number; longitude: number; address?: string; phone?: string; capacity?: number;
  }) => api.post<ApiResponse<Responder>>('/responders', data),

  updateAvailability: (id: string, status: string) =>
    api.put<ApiResponse<Responder>>(`/responders/${id}/availability`, { status }),

  updateCapacity: (id: string, data: { totalBeds: number; availableBeds: number }) =>
    api.put<ApiResponse<Responder>>(`/responders/${id}/capacity`, data),

  updateLocation: (id: string, data: { latitude: number; longitude: number; address?: string }) =>
    api.put<ApiResponse<Responder>>(`/responders/${id}/location`, data),

  getHospitals: () =>
    api.get<ApiResponse<Responder[]>>('/responders/hospitals'),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehicleApi = {
  list: (params?: { type?: string; status?: string }) =>
    api.get<ApiResponse<Vehicle[]>>('/vehicles', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`),

  getLocation: (id: string) =>
    api.get<ApiResponse<{ latitude: number; longitude: number; updatedAt: string }>>(`/vehicles/${id}/location`),

  getHistory: (id: string, limit = 100) =>
    api.get<ApiResponse<unknown[]>>(`/vehicles/${id}/history?limit=${limit}`),

  getByIncident: (incidentId: string) =>
    api.get<ApiResponse<Vehicle[]>>(`/dispatch/${incidentId}`),

  register: (data: {
    vehicleCode: string; type: string; stationId: string; stationName: string;
    incidentServiceId: string; driverUserId: string; driverName: string;
    latitude: number; longitude: number;
  }) => api.post<ApiResponse<Vehicle>>('/vehicles/register', data),

  completeTrip: (vehicleId: string, incidentId: string) =>
    api.post<ApiResponse<unknown>>(`/vehicles/${vehicleId}/trip/complete`, { incidentId }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardSnapshot>>('/analytics/dashboard'),

  getResponseTimes: (period = 'week') =>
    api.get<ApiResponse<unknown>>(`/analytics/response-times?period=${period}`),

  getIncidentsByRegion: (period = 'week') =>
    api.get<ApiResponse<RegionStat[]>>(`/analytics/incidents-by-region?period=${period}`),

  getResourceUtilization: () =>
    api.get<ApiResponse<unknown>>('/analytics/resource-utilization'),

  getPeakHours: (period = 'month') =>
    api.get<ApiResponse<PeakHourData[]>>(`/analytics/peak-hours?period=${period}`),

  getTopResponders: (limit = 10) =>
    api.get<ApiResponse<unknown[]>>(`/analytics/top-responders?limit=${limit}`),

  getSla: (period = 'week') =>
    api.get<ApiResponse<SlaReport>>(`/analytics/sla?period=${period}`),

  getHeatmap: (period = 'month') =>
    api.get<ApiResponse<HeatmapPoint[]>>(`/analytics/heatmap?period=${period}`),

  getHospitalCapacity: () =>
    api.get<ApiResponse<unknown>>('/analytics/hospital-capacity'),
};

// ─── AI Agent ─────────────────────────────────────────────────────────────────
export const agentApi = {
  getStatus: () =>
    api.get<ApiResponse<unknown>>('/agent/status'),

  ingestCall: (formData: FormData) =>
    api.post<ApiResponse<{ sessionId: string; status: string; message: string }>>(
      '/agent/call/ingest', formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  listSessions: (page = 1, limit = 20) =>
    api.get<ApiResponse<PaginatedResponse<CallSession>>>(`/agent/calls?page=${page}&limit=${limit}`),

  getSession: (sessionId: string) =>
    api.get<ApiResponse<{ session: CallSession; transcription: unknown; extraction: unknown }>>(
      `/agent/calls/${sessionId}`
    ),

  reviewSession: (sessionId: string, corrections: Record<string, string>) =>
    api.put<ApiResponse<null>>(`/agent/calls/${sessionId}/review`, { corrections }),

  replayNlp: (sessionId: string) =>
    api.post<ApiResponse<null>>(`/agent/calls/${sessionId}/replay`),

  markOnline: () =>
    api.post('/agent/operator/online'),

  markOffline: () =>
    api.post('/agent/operator/offline'),

  heartbeat: () =>
    api.post('/agent/operator/heartbeat'),
};

// ─── Gateway ──────────────────────────────────────────────────────────────────
export const gatewayApi = {
  healthAll: () =>
    api.get<unknown>('/health/all'),
};
