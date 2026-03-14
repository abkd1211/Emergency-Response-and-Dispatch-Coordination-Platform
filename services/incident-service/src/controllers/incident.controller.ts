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
      const { page, limit, status, type } = req.query as Record<string, string>;
      const result = await incidentService.listIncidents(
        parseInt(page ?? '1'),
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
      const incident = await incidentService.getIncidentById(req.params.id);
      sendSuccess(res, 200, 'Incident retrieved', incident);
    } catch (err) { next(err); }
  };

  // ─── PUT /incidents/:id/status ────────────────────────────────────────────────
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user    = (req as AuthenticatedRequest).user;
      const updated = await incidentService.updateIncidentStatus(req.params.id, req.body, user.id);
      sendSuccess(res, 200, 'Incident status updated', updated);
    } catch (err) { next(err); }
  };

  // ─── PUT /incidents/:id/assign ────────────────────────────────────────────────
  assignResponder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user    = (req as AuthenticatedRequest).user;
      const updated = await incidentService.assignResponder(
        req.params.id, req.body.responderId, user.id
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
      const responder  = await incidentService.updateResponderStatus(req.params.id, status);
      sendSuccess(res, 200, 'Responder status updated', responder);
    } catch (err) { next(err); }
  };

  // ─── GET /incidents/nearest/:lat/:lng/:type ───────────────────────────────────
  getNearestResponder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng, type } = req.params;
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
}

export default new IncidentController();
