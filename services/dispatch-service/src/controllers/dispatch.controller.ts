import { Request, Response, NextFunction } from 'express';
import dispatchService from '../services/dispatch.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class DispatchController {

  // POST /vehicles/register
  registerVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await dispatchService.registerVehicle(req.body);
      sendSuccess(res, 201, 'Vehicle registered successfully', vehicle);
    } catch (err) { next(err); }
  };

  // GET /vehicles
  listVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, status } = req.query as { type?: string; status?: string };
      const vehicles = await dispatchService.getVehicles(type, status);
      sendSuccess(res, 200, 'Vehicles retrieved', vehicles);
    } catch (err) { next(err); }
  };

  // GET /vehicles/:id
  getVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await dispatchService.getVehicleById(req.params.id);
      sendSuccess(res, 200, 'Vehicle retrieved', vehicle);
    } catch (err) { next(err); }
  };

  // GET /vehicles/:id/location
  getVehicleLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const location = await dispatchService.getVehicleLocation(req.params.id);
      sendSuccess(res, 200, 'Vehicle location retrieved', location);
    } catch (err) { next(err); }
  };

  // PUT /vehicles/:id/location  (REST fallback for GPS ping)
  updateVehicleLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await dispatchService.processGpsPing({
        vehicleId:  req.params.id,
        latitude:   req.body.latitude,
        longitude:  req.body.longitude,
        speedKmh:   req.body.speedKmh,
        heading:    req.body.heading,
        batteryPct: req.body.batteryPct,
      });
      sendSuccess(res, 200, 'Location updated', null);
    } catch (err) { next(err); }
  };

  // GET /vehicles/:id/history
  getLocationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit   = Math.min(parseInt(req.query.limit as string ?? '100'), 500);
      const history = await dispatchService.getVehicleLocationHistory(req.params.id, limit);
      sendSuccess(res, 200, 'Location history retrieved', history);
    } catch (err) { next(err); }
  };

  // GET /vehicles/:id/assignment
  getActiveAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignment = await dispatchService.getActiveAssignment(req.params.id);
      sendSuccess(res, 200, 'Active assignment retrieved', assignment);
    } catch (err) { next(err); }
  };

  // POST /vehicles/:id/trip/complete
  completeTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await dispatchService.completeTrip(req.params.id, req.body.incidentId);
      sendSuccess(res, 200, 'Trip completed and summary generated', null);
    } catch (err) { next(err); }
  };

  // GET /dispatch/:incidentId
  getVehiclesByIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicles = await dispatchService.getVehiclesByIncident(req.params.incidentId);
      sendSuccess(res, 200, 'Incident vehicles retrieved', vehicles);
    } catch (err) { next(err); }
  };
}

export default new DispatchController();
