import { Request, Response, NextFunction } from 'express';
import incidentService from '../services/incident.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, ResponderType, ResponderStatus } from '../types';

export class IncidentController {

  // ─── POST /incidents ──────────────────────────────────────────────────────────
  createIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user     = (req as AuthenticatedRequest).user;
      const incident = await incidentService.createIncident(req.body, user.id);
      sendSuccess(res, 201, 'Incident created and responder dispatched', incident);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents ───────────────────────────────────────────────────────────
  listIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page   = req.query.page   as string | undefined;
      const limit  = req.query.limit  as string | undefined;
      const status = req.query.status as string | undefined;
      const type   = req.query.type   as string | undefined;
      const result = await incidentService.listIncidents(
        parseInt(page  ?? '1'),
        Math.min(parseInt(limit ?? '20'), 100),
        { status: status as never, type: type as never }
      );
      sendSuccess(res, 200, 'Incidents retrieved', result);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/open ──────────────────────────────────────────────────────
  listOpenIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incidents = await incidentService.listOpenIncidents();
      sendSuccess(res, 200, 'Open incidents retrieved', incidents);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/:id ───────────────────────────────────────────────────────
  getIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const incident = await incidentService.getIncidentById(id);
      sendSuccess(res, 200, 'Incident retrieved', incident);
    } catch (err) { next(err); }
  };

  // ─── PUT /incidents/:id/status ────────────────────────────────────────────────
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user    = (req as AuthenticatedRequest).user;
      const id = req.params.id as string;
      const updated = await incidentService.updateIncidentStatus(id, req.body, user.id);
      sendSuccess(res, 200, 'Incident status updated', updated);
    } catch (err) { next(err); }
  };

  // ─── PUT /incidents/:id/assign ────────────────────────────────────────────────
  assignResponder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user    = (req as AuthenticatedRequest).user;
      const id = req.params.id as string;
      const updated = await incidentService.assignResponder(
        id, req.body.responderId, user.id
      );
      sendSuccess(res, 200, 'Responder assigned', updated);
    } catch (err) { next(err); }
  };

  // ─── GET /responders ─────────────────────────────────────────────────────────
  listResponders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query as { type?: ResponderType };
      const responders = await incidentService.listResponders(type);
      sendSuccess(res, 200, 'Responders retrieved', responders);
    } catch (err) { next(err); }
  };

  // ─── POST /responders ────────────────────────────────────────────────────────
  createResponder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user      = (req as AuthenticatedRequest).user;
      const responder = await incidentService.createResponder(req.body, user.id);
      sendSuccess(res, 201, 'Responder registered', responder);
    } catch (err) { next(err); }
  };

  // ─── PUT /responders/:id/availability ────────────────────────────────────────
  updateResponderAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body as { status: ResponderStatus };
      const id = req.params.id as string;
      const responder  = await incidentService.updateResponderStatus(id, status);
      sendSuccess(res, 200, 'Responder status updated', responder);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/nearest/:lat/:lng/:type ───────────────────────────────────
  getNearestResponder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lat  = req.params.lat  as string;
      const lng  = req.params.lng  as string;
      const type = req.params.type as string;
      const result = await incidentService.findNearestAvailableResponder(
        parseFloat(lat),
        parseFloat(lng),
        type as ResponderType
      );
      if (!result) {
        sendSuccess(res, 200, 'No available responders found', null);
        return;
      }
      sendSuccess(res, 200, 'Nearest responder found', result);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/nearby?lat=&lng=&radius= ──────────────────────────────────
  // Used by frontend BEFORE submitting a new incident form to warn admins
  // of any already-active incidents within radius metres.
  getNearbyIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lat    = parseFloat(req.query.lat as string);
      const lng    = parseFloat(req.query.lng as string);
      const radius = parseInt(req.query.radius as string ?? '200');
      const nearby = await incidentService.getNearbyIncidents(lat, lng, radius);
      sendSuccess(res, 200, `Found ${nearby.length} nearby open incident(s)`, nearby);
    } catch (err) { next(err); }
  };

  // ─── POST /incidents/link ─────────────────────────────────────────────────────
  // Admin links a new witness call to an existing active incident
  // instead of creating a duplicate. Auto-escalates priority if multiple reports.
  linkIncidentReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user   = (req as AuthenticatedRequest).user;
      const result = await incidentService.linkIncidentReport(req.body, user.id);
      sendSuccess(res, 201, 'Report linked to existing incident', result);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/:id/linked-reports ───────────────────────────────────────
  getLinkedReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const reports = await incidentService.getLinkedReports(id);
      sendSuccess(res, 200, 'Linked reports retrieved', reports);
    } catch (err) { next(err); }
  };
}

export default new IncidentController();
