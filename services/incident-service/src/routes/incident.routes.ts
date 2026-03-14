import { Router } from 'express';
import incidentController from '../controllers/incident.controller';
import { authenticate, authorise } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
  assignResponderSchema,
  createResponderSchema,
  updateResponderAvailabilitySchema,
  nearestResponderSchema,
  listIncidentsSchema,
} from '../validators/incident.validators';

const router = Router();

// ─── All routes require authentication ───────────────────────────────────────
router.use(authenticate);

// ─── Incidents ────────────────────────────────────────────────────────────────
router.post(
  '/',
  authorise('SYSTEM_ADMIN'),
  validate(createIncidentSchema),
  incidentController.createIncident
);

router.get(
  '/',
  validate(listIncidentsSchema),
  incidentController.listIncidents
);

// NOTE: /open must be defined BEFORE /:id to avoid route collision
router.get(
  '/open',
  incidentController.listOpenIncidents
);

router.get(
  '/nearest/:lat/:lng/:type',
  validate(nearestResponderSchema),
  incidentController.getNearestResponder
);

router.get(
  '/:id',
  incidentController.getIncident
);

router.put(
  '/:id/status',
  validate(updateIncidentStatusSchema),
  incidentController.updateStatus
);

router.put(
  '/:id/assign',
  authorise('SYSTEM_ADMIN'),
  validate(assignResponderSchema),
  incidentController.assignResponder
);

// ─── Responders ───────────────────────────────────────────────────────────────
router.get(
  '/responders',
  incidentController.listResponders
);

router.post(
  '/responders',
  authorise('SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_SERVICE_ADMIN'),
  validate(createResponderSchema),
  incidentController.createResponder
);

router.put(
  '/responders/:id/availability',
  validate(updateResponderAvailabilitySchema),
  incidentController.updateResponderAvailability
);

export default router;
