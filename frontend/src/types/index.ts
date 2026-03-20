// ─── Auth ─────────────────────────────────────────────────────────────────────
export type Role =
  | 'SYSTEM_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'POLICE_ADMIN'
  | 'FIRE_SERVICE_ADMIN'
  | 'AMBULANCE_DRIVER';

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      Role;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
}

export interface AuthResponse {
  user:   User;
  tokens: TokenPair;
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export type IncidentType   = 'MEDICAL' | 'FIRE' | 'CRIME' | 'ACCIDENT' | 'OTHER';
export type IncidentStatus = 'CREATED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type ResponderType  = 'AMBULANCE' | 'POLICE' | 'FIRE_TRUCK';

export interface Responder {
  id:            string;
  name:          string;
  type:          ResponderType;
  stationName:   string;
  latitude:      number;
  longitude:     number;
  address:       string | null;
  phone:         string | null;
  status:        'AVAILABLE' | 'BUSY' | 'OFFLINE';
  capacity:      number;
  totalBeds:     number | null;
  availableBeds: number | null;
  bedsUpdatedAt: string | null;
}

export interface StatusHistory {
  id:        string;
  oldStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changedBy: string;
  note:      string | null;
  changedAt: string;
}

export interface Incident {
  id:               string;
  citizenName:      string;
  citizenPhone:     string | null;
  incidentType:     IncidentType;
  latitude:         number;
  longitude:        number;
  address:          string | null;
  notes:            string | null;
  priority:         number;
  status:           IncidentStatus;
  createdBy:        string;
  assignedUnitId:   string | null;
  assignedUnitType: ResponderType | null;
  dispatchedAt:     string | null;
  resolvedAt:       string | null;
  createdAt:        string;
  updatedAt:        string;
  statusHistory:    StatusHistory[];
  responder:        Responder | null;
}

export interface NearbyIncident {
  incidentId:        string;
  incidentType:      IncidentType;
  status:            IncidentStatus;
  distanceMetres:    number;
  latitude:          number;
  longitude:         number;
  address:           string | null;
  createdBy:         string;
  createdAt:         string;
  assignedUnit:      { id: string; name: string; station: string } | null;
  linkedReportCount: number;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export type VehicleStatus =
  | 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE'
  | 'ON_SCENE'  | 'RETURNING'  | 'OFFLINE' | 'UNRESPONSIVE';

export interface VehicleLocation {
  latitude:  number;
  longitude: number;
  updatedAt: string;
}

export interface Vehicle {
  _id:               string;
  vehicleCode:       string;
  type:              ResponderType;
  stationName:       string;
  driverName:        string;
  status:            VehicleStatus;
  currentLocation:   VehicleLocation;
  currentIncidentId: string | null;
  speedKmh:          number;
  heading:           string;
  batteryPct:        number | null;
  isUnresponsive:    boolean;
  routeDeviation:    boolean;
  lastHeartbeatAt:   string;
}

// ─── Socket.io Events ─────────────────────────────────────────────────────────
export interface LocationUpdateEvent {
  vehicleId:   string;
  vehicleCode: string;
  type:        ResponderType;
  latitude:    number;
  longitude:   number;
  speedKmh:    number;
  heading:     string;
  batteryPct:  number | null;
  timestamp:   string;
}

export interface EtaUpdateEvent {
  vehicleId:   string;
  vehicleCode: string;
  etaSec:      number;
  etaMinutes:  number;
}

export interface RouteDeviationEvent {
  vehicleId:       string;
  vehicleCode:     string;
  deviationMetres: number;
  currentLocation: { latitude: number; longitude: number };
}

export interface VehicleArrivedEvent {
  vehicleId:   string;
  vehicleCode: string;
  arrivalSec:  number;
  arrivedAt:   string;
}

export interface VehicleUnresponsiveEvent {
  vehicleId:   string;
  vehicleCode: string;
  lastSeenAt:  string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DashboardSnapshot {
  generatedAt:          string;
  totalIncidents:       number;
  openIncidents:        number;
  resolvedToday:        number;
  avgResponseTimeSec:   number;
  slaComplianceRate:    number;
  activeVehicles:       number;
  unresponsiveVehicles: number;
  incidentsByType:      Record<string, number>;
  incidentsByStatus:    Record<string, number>;
  topResponders: {
    responderId:        string;
    responderName:      string;
    responderType:      string;
    totalDispatches:    number;
    avgDispatchTimeSec: number;
    slaComplianceRate:  number;
  }[];
  recentActivity: {
    incidentId: string;
    type:       string;
    region:     string;
    status:     string;
    createdAt:  string;
  }[];
}

export interface PeakHourData {
  hour:  number;
  count: number;
  label: string;
}

export interface RegionStat {
  region:      string;
  total:       number;
  byType:      Record<string, number>;
  avgPriority: number;
}

export interface SlaReport {
  totalIncidents:  number;
  withinSla:       number;
  outsideSla:      number;
  complianceRate:  number;
  slaTargetSec:    number;
  byType: Record<string, { total: number; withinSla: number; rate: number }>;
}

export interface HeatmapPoint {
  latitude:  number;
  longitude: number;
  weight:    number;
  type:      string;
}

// ─── AI Agent ────────────────────────────────────────────────────────────────
export type SessionStatus =
  | 'RECEIVED' | 'TRANSCRIBING' | 'EXTRACTING'
  | 'PENDING_REVIEW' | 'AUTO_SUBMITTED' | 'REVIEWED'
  | 'DISCARDED' | 'FAILED';

export interface FieldConfidence {
  value:      string | number | null;
  confidence: number;
  source:     string;
}

export interface CallSession {
  sessionId:         string;
  callerPhone:       string;
  audioFileName:     string;
  status:            SessionStatus;
  detectedLanguage:  string | null;
  languageName:      string | null;
  operatorAvailable: boolean;
  handledBy:         string | null;
  startedAt:         string;
  incidentServiceId: string | null;
  createdAt:         string;
}

export interface Transcription {
  sessionId:       string;
  rawText:         string;
  cleanedText:     string;
  language:        string;
  confidenceScore: number;
  wordCount:       number;
  whisperModel:    string;
  processingMs:    number;
}

export interface ExtractedIncident {
  sessionId:         string;
  citizenName:       FieldConfidence;
  incidentType:      FieldConfidence;
  locationText:      FieldConfidence;
  latitude:          FieldConfidence;
  longitude:         FieldConfidence;
  notes:             FieldConfidence;
  urgencyLevel:      FieldConfidence;
  overallConfidence: number;
  autoSubmitted:     boolean;
  manuallyEdited:    boolean;
  corrections:       { field: string; oldValue: string; newValue: string; correctedBy: string; correctedAt: string }[];
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

export interface PaginatedResponse<T> {
  data:  T[];
  total: number;
  page:  number;
  pages: number;
  limit: number;
}
