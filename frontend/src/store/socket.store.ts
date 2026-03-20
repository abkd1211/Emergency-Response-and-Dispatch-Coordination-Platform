'use client';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type {
  LocationUpdateEvent, EtaUpdateEvent,
  RouteDeviationEvent, VehicleArrivedEvent, VehicleUnresponsiveEvent,
} from '@/types';

interface VehicleState {
  latitude:        number;
  longitude:       number;
  heading:         string;
  speedKmh:        number;
  batteryPct:      number | null;
  timestamp:       string;
  isUnresponsive:  boolean;
  hasDeviation:    boolean;
  hasArrived:      boolean;
  etaSec:          number | null;
  etaMinutes:      number | null;
}

interface SocketState {
  socket:          Socket | null;
  connected:       boolean;
  vehicles:        Record<string, VehicleState>;
  alerts:          { id: string; type: 'deviation' | 'unresponsive' | 'arrived'; vehicleCode: string; message: string; timestamp: string }[];

  connect:         (token: string) => void;
  disconnect:      () => void;
  joinIncidentRoom:(incidentId: string) => void;
  joinVehicleRoom: (vehicleId: string) => void;
  leaveRoom:       (room: string) => void;
  clearAlert:      (id: string) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_DISPATCH_WS_URL || 'http://localhost:3003';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket:    null,
  connected: false,
  vehicles:  {},
  alerts:    [],

  connect: (token: string) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(WS_URL, {
      auth:       { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      set({ connected: true });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    // ── Location update ──────────────────────────────────────────────────────
    socket.on('location:update', (data: LocationUpdateEvent) => {
      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [data.vehicleId]: {
            ...state.vehicles[data.vehicleId],
            latitude:    data.latitude,
            longitude:   data.longitude,
            heading:     data.heading,
            speedKmh:    data.speedKmh,
            batteryPct:  data.batteryPct,
            timestamp:   data.timestamp,
          },
        },
      }));
    });

    // ── ETA update ───────────────────────────────────────────────────────────
    socket.on('eta:update', (data: EtaUpdateEvent) => {
      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [data.vehicleId]: {
            ...state.vehicles[data.vehicleId],
            etaSec:     data.etaSec,
            etaMinutes: data.etaMinutes,
          },
        },
      }));
    });

    // ── Route deviation ──────────────────────────────────────────────────────
    socket.on('route:deviation', (data: RouteDeviationEvent) => {
      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [data.vehicleId]: { ...state.vehicles[data.vehicleId], hasDeviation: true },
        },
        alerts: [
          ...state.alerts,
          {
            id:          `dev-${data.vehicleId}-${Date.now()}`,
            type:        'deviation',
            vehicleCode: data.vehicleCode,
            message:     `${data.vehicleCode} deviated ${data.deviationMetres}m from route`,
            timestamp:   new Date().toISOString(),
          },
        ],
      }));
    });

    // ── Vehicle arrived ──────────────────────────────────────────────────────
    socket.on('vehicle:arrived', (data: VehicleArrivedEvent) => {
      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [data.vehicleId]: { ...state.vehicles[data.vehicleId], hasArrived: true },
        },
        alerts: [
          ...state.alerts,
          {
            id:          `arr-${data.vehicleId}-${Date.now()}`,
            type:        'arrived',
            vehicleCode: data.vehicleCode,
            message:     `${data.vehicleCode} arrived on scene`,
            timestamp:   data.arrivedAt,
          },
        ],
      }));
    });

    // ── Vehicle unresponsive ─────────────────────────────────────────────────
    socket.on('vehicle:unresponsive', (data: VehicleUnresponsiveEvent) => {
      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [data.vehicleId]: { ...state.vehicles[data.vehicleId], isUnresponsive: true },
        },
        alerts: [
          ...state.alerts,
          {
            id:          `unresp-${data.vehicleId}-${Date.now()}`,
            type:        'unresponsive',
            vehicleCode: data.vehicleCode,
            message:     `${data.vehicleCode} is not responding`,
            timestamp:   new Date().toISOString(),
          },
        ],
      }));
    });

    // ── New incident broadcast (from admin room) ──────────────────────────────
    socket.on('incident:new', (data: unknown) => {
      // Emit a custom DOM event so any component can listen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('incident:new', { detail: data }));
      }
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false, vehicles: {} });
  },

  joinIncidentRoom: (incidentId: string) => {
    get().socket?.emit('join:incident', incidentId);
  },

  joinVehicleRoom: (vehicleId: string) => {
    get().socket?.emit('join:vehicle', vehicleId);
  },

  leaveRoom: (room: string) => {
    get().socket?.emit('leave:room', room);
  },

  clearAlert: (id: string) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },
}));
