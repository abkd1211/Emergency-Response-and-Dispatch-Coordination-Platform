import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer }            from 'http';
import jwt                                 from 'jsonwebtoken';
import { env }                             from '../config/env';
import { Vehicle }     from '../models/vehicle.model';
import logger                              from '../config/logger';
import dispatchService                     from '../services/dispatch.service';
import { SOCKET_EVENTS, GpsPingDto }       from '../types';

interface AuthSocket extends Socket {
  user?: { id: string; email: string; role: string };
}

// ─── Bootstrap Socket.io ──────────────────────────────────────────────────────
export const createSocketServer = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin:      env.ALLOWED_ORIGINS.split(','),
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    transports:       ['websocket', 'polling'],
    pingTimeout:      20000,
    pingInterval:     10000,
  });

  // ─── JWT Authentication Middleware ────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return next(new Error('Authentication required'));

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        sub: string; email: string; role: string;
      };

      socket.user = { id: payload.sub, email: payload.email, role: payload.role };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────────────────
  io.on('connection', (socket: AuthSocket) => {
    logger.info('Socket connected', {
      socketId: socket.id,
      userId:   socket.user?.id,
      role:     socket.user?.role,
    });

    // ── Join incident tracking room ──────────────────────────────────────────
    // Frontend admins join this to watch all vehicles for an incident
    socket.on(SOCKET_EVENTS.JOIN_INCIDENT_ROOM, (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
      logger.debug('Socket joined incident room', { socketId: socket.id, incidentId });
      socket.emit('joined', { room: `incident:${incidentId}` });
    });

    // ── Join vehicle room ────────────────────────────────────────────────────
    // Drivers join this to receive their dispatch assignments and send pings
    socket.on(SOCKET_EVENTS.JOIN_VEHICLE_ROOM, (vehicleId: string) => {
      socket.join(`vehicle:${vehicleId}`);
      logger.debug('Socket joined vehicle room', { socketId: socket.id, vehicleId });
      socket.emit('joined', { room: `vehicle:${vehicleId}` });
    });

    // ── Leave room ───────────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room: string) => {
      socket.leave(room);
      logger.debug('Socket left room', { socketId: socket.id, room });
    });

    // ── GPS Ping (from driver's phone/app) ───────────────────────────────────
    socket.on(SOCKET_EVENTS.GPS_PING, async (data: GpsPingDto) => {
      try {
        // Drivers can only update their own vehicle
        if (socket.user?.role === 'AMBULANCE_DRIVER') {
          // Could add vehicle ownership check here in a real system
        }

        await dispatchService.processGpsPing(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'GPS ping failed';
        socket.emit(SOCKET_EVENTS.ERROR, { message });
        logger.error('GPS ping error', { socketId: socket.id, error: err });
      }
    });

    // ── Driver online ────────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.DRIVER_ONLINE, async (vehicleId: string) => {
      try {
        await Vehicle.findByIdAndUpdate(vehicleId, {
          isUnresponsive:  false,
          lastHeartbeatAt: new Date(),
        });
        logger.info('Driver online', { vehicleId, socketId: socket.id });
      } catch (err) {
        logger.error('Driver online error', { error: err });
      }
    });

    // ── Driver offline ───────────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.DRIVER_OFFLINE, async (vehicleId: string) => {
      logger.info('Driver offline', { vehicleId, socketId: socket.id });
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (err) => {
      logger.error('Socket error', { socketId: socket.id, error: err.message });
    });
  });

  // Pass io to dispatch service so it can emit events
  dispatchService.setSocketServer(io);

  return io;
};
