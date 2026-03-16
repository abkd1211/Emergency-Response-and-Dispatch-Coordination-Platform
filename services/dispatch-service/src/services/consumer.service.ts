import { ConsumeMessage } from 'amqplib';
import { getChannel, CONSUME_QUEUES } from '../config/rabbitmq';
import dispatchService from '../services/dispatch.service';
import logger from '../config/logger';
import { IncidentDispatchedPayload } from '../types';

export const startConsumers = async (): Promise<void> => {
  await consumeIncidentCreated();
  await consumeIncidentDispatched();
  logger.info('RabbitMQ consumers started');
};

// ─── Consume: incident.created ───────────────────────────────────────────────
// Broadcasts to all connected admins for real-time situational awareness
const consumeIncidentCreated = async (): Promise<void> => {
  const channel = getChannel();
  if (!channel) { logger.error('RabbitMQ channel not ready'); return; }

  await channel.consume(
    CONSUME_QUEUES.INCIDENT_CREATED,
    async (msg) => {
      if (!msg) return;
      try {
        const event   = JSON.parse(msg.content.toString());
        const payload = event.payload;
        logger.info('Received incident.created', { eventId: event.event_id, incidentId: payload.incident_id });
        dispatchService.broadcastNewIncident(payload);
        channel.ack(msg);
      } catch (err) {
        logger.error('Failed to process incident.created', { error: err });
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  logger.info(`Consumer started: ${CONSUME_QUEUES.INCIDENT_CREATED}`);
};

const consumeIncidentDispatched = async (): Promise<void> => {
  const channel = getChannel();
  if (!channel) { logger.error('RabbitMQ channel not ready'); return; }

  await channel.consume(
    CONSUME_QUEUES.INCIDENT_DISPATCHED,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;
      try {
        const event   = JSON.parse(msg.content.toString());
        const payload = event.payload as IncidentDispatchedPayload;
        logger.info('Received incident.dispatched', { eventId: event.event_id, incidentId: payload.incident_id });
        await dispatchService.handleIncidentDispatched(payload);
        channel.ack(msg);
      } catch (err) {
        logger.error('Failed to process incident.dispatched', { error: err });
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  logger.info(`Consumer started: ${CONSUME_QUEUES.INCIDENT_DISPATCHED}`);
};
