import amqplib, { Channel, Options } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';
import logger from './logger';

// ─── Exchange & Queue Constants ───────────────────────────────────────────────
export const EXCHANGE      = 'emergency.events';
export const DL_EXCHANGE   = 'emergency.dead-letter';

export const ROUTING_KEYS = {
  INCIDENT_CREATED:    'incident.created',
  INCIDENT_DISPATCHED: 'incident.dispatched',
  INCIDENT_RESOLVED:   'incident.resolved',
  INCIDENT_UPDATED:    'incident.updated',
} as const;

// Queues this service CONSUMES from
export const CONSUME_QUEUES = {
  AI_CALL_PROCESSED: 'incident.ai.call.processed',
} as const;

// ─── Connection State ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let connection: any = null;
let channel:    Channel | null = null;

// ─── Connect ──────────────────────────────────────────────────────────────────
export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const conn = await amqplib.connect(env.RABBITMQ_URL);
    const ch   = await conn.createChannel();

    // Assert the main topic exchange
    await ch.assertExchange(EXCHANGE,    'topic',  { durable: true });
    await ch.assertExchange(DL_EXCHANGE, 'direct', { durable: true });

    // Assert queues this service will consume from
    await ch.assertQueue(CONSUME_QUEUES.AI_CALL_PROCESSED, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': DL_EXCHANGE },
    });
    await ch.bindQueue(CONSUME_QUEUES.AI_CALL_PROCESSED, EXCHANGE, 'ai.call.processed');

    // Set prefetch — process one message at a time per consumer
    ch.prefetch(1);

    // Assign to module-level state
    connection = conn;
    channel    = ch;

    logger.info('RabbitMQ connected and channels ready');

    // Handle connection errors & reconnect
    conn.on('error', (err: Error) => {
      logger.error('RabbitMQ connection error', { error: err.message });
      reconnect();
    });
    conn.on('close', () => {
      logger.warn('RabbitMQ connection closed — reconnecting...');
      reconnect();
    });
  } catch (err) {
    logger.error('Failed to connect to RabbitMQ', { error: err });
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

// ─── Reconnect ────────────────────────────────────────────────────────────────
const reconnect = (): void => {
  connection = null;
  channel    = null;
  setTimeout(connectRabbitMQ, 5000);
};

// ─── Publish Event ────────────────────────────────────────────────────────────
export const publishEvent = async <T extends object>(
  routingKey: string,
  payload: T,
  options: Options.Publish = {}
): Promise<boolean> => {
  if (!channel) {
    logger.error('RabbitMQ channel not available — cannot publish event', { routingKey });
    return false;
  }

  const message = {
    event_id:   uuidv4(),
    event_type: routingKey,
    source:     env.SERVICE_NAME,
    timestamp:  new Date().toISOString(),
    version:    '1.0',
    payload,
  };

  try {
    const sent = channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent:  true,
        contentType: 'application/json',
        messageId:   message.event_id,
        timestamp:   Date.now(),
        ...options,
      }
    );

    if (sent) {
      logger.debug('Event published', { routingKey, eventId: message.event_id });
    } else {
      logger.warn('Publish returned false — channel buffer full', { routingKey });
    }

    return sent;
  } catch (err) {
    logger.error('Failed to publish event', { routingKey, error: err });
    return false;
  }
};

// ─── Get Channel (for consumers) ──────────────────────────────────────────────
export const getChannel = (): Channel | null => channel;

// ─── Disconnect ───────────────────────────────────────────────────────────────
export const disconnectRabbitMQ = async (): Promise<void> => {
  try {
    await channel?.close();
    await connection?.close();
    logger.info('RabbitMQ disconnected');
  } catch (err) {
    logger.error('Error disconnecting RabbitMQ', { error: err });
  }
};
