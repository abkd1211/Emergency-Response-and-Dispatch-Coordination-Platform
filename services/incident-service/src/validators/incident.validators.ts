import { z } from 'zod';
import { IncidentType, IncidentStatus, ResponderType, ResponderStatus } from '@prisma/client';

// ─── Create Incident ──────────────────────────────────────────────────────────
export const createIncidentSchema = z.object({
  body: z.object({
    citizenName: z
      .string({ required_error: 'Citizen name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .trim(),
    citizenPhone: z
      .string()
      .regex(/^\+?[0-9\s\-]{7,15}$/, 'Invalid phone number format')
      .optional(),
    incidentType: z.nativeEnum(IncidentType, {
      errorMap: () => ({ message: `Must be one of: ${Object.values(IncidentType).join(', ')}` }),
    }),
    latitude: z
      .number({ required_error: 'Latitude is required' })
      .min(-90,  'Latitude must be >= -90')
      .max(90,   'Latitude must be <= 90'),
    longitude: z
      .number({ required_error: 'Longitude is required' })
      .min(-180, 'Longitude must be >= -180')
      .max(180,  'Longitude must be <= 180'),
    address:  z.string().max(255).trim().optional(),
    notes:    z.string().max(1000).trim().optional(),
    priority: z.number().int().min(1).max(3).default(1).optional(),
  }),
});

// ─── Update Incident Status ───────────────────────────────────────────────────
export const updateIncidentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid incident ID'),
  }),
  body: z.object({
    status: z.nativeEnum(IncidentStatus, {
      errorMap: () => ({ message: `Must be one of: ${Object.values(IncidentStatus).join(', ')}` }),
    }),
    note: z.string().max(500).trim().optional(),
  }),
});

// ─── Assign Responder ─────────────────────────────────────────────────────────
export const assignResponderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid incident ID'),
  }),
  body: z.object({
    responderId: z.string().uuid('Invalid responder ID'),
  }),
});

// ─── Create Responder ─────────────────────────────────────────────────────────
export const createResponderSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2).max(150).trim(),
    type: z.nativeEnum(ResponderType, {
      errorMap: () => ({ message: `Must be one of: ${Object.values(ResponderType).join(', ')}` }),
    }),
    stationName: z
      .string({ required_error: 'Station name is required' })
      .min(2).max(150).trim(),
    latitude: z
      .number({ required_error: 'Latitude is required' })
      .min(-90).max(90),
    longitude: z
      .number({ required_error: 'Longitude is required' })
      .min(-180).max(180),
    address:  z.string().max(255).trim().optional(),
    phone:    z.string().regex(/^\+?[0-9\s\-]{7,15}$/).optional(),
    capacity: z.number().int().min(1).max(50).default(1).optional(),
  }),
});

// ─── Update Responder Availability ───────────────────────────────────────────
export const updateResponderAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid responder ID'),
  }),
  body: z.object({
    status: z.nativeEnum(ResponderStatus, {
      errorMap: () => ({ message: `Must be one of: ${Object.values(ResponderStatus).join(', ')}` }),
    }),
  }),
});

// ─── Nearest Responder Params ─────────────────────────────────────────────────
export const nearestResponderSchema = z.object({
  params: z.object({
    lat:  z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid latitude').transform(Number),
    lng:  z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid longitude').transform(Number),
    type: z.nativeEnum(ResponderType, {
      errorMap: () => ({ message: `Type must be one of: ${Object.values(ResponderType).join(', ')}` }),
    }),
  }),
});

// ─── List Incidents Query ─────────────────────────────────────────────────────
export const listIncidentsSchema = z.object({
  query: z.object({
    page:   z.string().optional().transform(v => parseInt(v ?? '1')),
    limit:  z.string().optional().transform(v => Math.min(parseInt(v ?? '20'), 100)),
    status: z.nativeEnum(IncidentStatus).optional(),
    type:   z.nativeEnum(IncidentType).optional(),
  }),
});
