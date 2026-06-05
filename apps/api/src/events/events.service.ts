import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Types d'événements supportés
export type EventType =
  | 'user_registered'
  | 'user_logged_in'
  | 'design_generated'
  | 'design_selected'
  | 'design_rated'
  | 'couturiere_viewed'
  | 'couturiere_contacted'
  | 'message_sent'
  | 'order_requested'
  | 'order_status_changed'
  | 'order_confirmed'
  | 'subscription_started'
  | 'account_deleted';

export interface EventPayload {
  [key: string]: unknown;
}

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private pubSubClient: any = null;
  private topicName: string;
  private readonly pseudoSalt: string;
  private readonly isDev: boolean;

  constructor(private config: ConfigService) {
    this.topicName = config.get('PUBSUB_TOPIC', 'fap-events');
    this.pseudoSalt = config.get('PSEUDONYMIZATION_SALT', 'dev-salt-change-in-prod');
    this.isDev = config.get('NODE_ENV', 'development') !== 'production';
  }

  async onModuleInit() {
    if (this.isDev) {
      this.logger.warn('Mode développement — événements Pub/Sub loggés localement uniquement');
      return;
    }

    try {
      // Import dynamique pour éviter l'erreur si les credentials GCP ne sont pas configurés
      const { PubSub } = await import('@google-cloud/pubsub');
      this.pubSubClient = new PubSub();
      this.logger.log(`Connecté à GCP Pub/Sub — Topic : ${this.topicName}`);
    } catch (error) {
      this.logger.error('Impossible de se connecter à GCP Pub/Sub', error);
    }
  }

  // ── Émettre un événement ─────────────────────────────────────
  async emit(
    eventType: EventType,
    userId: string | null,
    payload: EventPayload = {},
    sessionId?: string,
  ): Promise<void> {
    const event = {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: '1.0',
      user_id_hash: userId ? this.pseudonymizeUserId(userId) : null,
      session_id: sessionId ?? null,
      timestamp: new Date().toISOString(),
      platform: 'web',
      payload,
    };

    if (this.isDev) {
      // En développement : juste logger l'événement
      this.logger.debug(`[EVENT] ${eventType}`, { user_id_hash: event.user_id_hash, payload });
      return;
    }

    // En production : envoyer vers Pub/Sub
    try {
      if (!this.pubSubClient) return;

      const messageBuffer = Buffer.from(JSON.stringify(event));
      await this.pubSubClient.topic(this.topicName).publish(messageBuffer, {
        eventType,
        version: '1.0',
      });
    } catch (error) {
      // Les erreurs Pub/Sub ne doivent jamais bloquer l'application
      this.logger.error(`Erreur Pub/Sub pour l'événement ${eventType}`, error);
    }
  }

  // ── Pseudonymisation SHA-256 ──────────────────────────────────
  private pseudonymizeUserId(userId: string): string {
    return createHash('sha256')
      .update(userId + this.pseudoSalt)
      .digest('hex');
  }
}
