import nodemailer from 'nodemailer';
import { db } from '../../../database';
import { notificationDeliveryLogs } from '../shared/notification-delivery-logs.schema';
import { users } from '../../user';
import { logger } from '../../../utils';
import { config } from '../../../utils/config/validate-env';
import { eq } from 'drizzle-orm';

class DeliveryService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initEmail();
  }

  private initEmail() {
    try {
      if (config.EMAIL_SERVICE && config.EMAIL_USER && config.EMAIL_PASSWORD) {
        this.emailTransporter = nodemailer.createTransport({
          service: config.EMAIL_SERVICE,
          auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASSWORD },
        });
        logger.info('Email transporter initialized');
      } else {
        logger.warn('Email configuration missing - delivery disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error });
    }
  }

  /** Orchestrates delivery across multiple channels for a single notification. */
  async deliverNotification(
    notificationId: string,
    userId: string,
    channels: string[],
    content: {
      title: string;
      message: string;
      emailSubject?: string;
      emailHtml?: string;
      emailText?: string;
      smsMessage?: string;
    },
  ): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      logger.error('User not found for delivery', { userId });
      return;
    }

    const deliveryPromises = channels.map(async (channel) => {
      switch (channel) {
        case 'email':
          return user.email ? this.sendEmail(notificationId, user.email, content) : null;
        case 'sms':
          return user.phone_number
            ? this.sendSMS(notificationId, user.phone_number, content)
            : null;
        case 'push':
        case 'in_app':
          // Handled via real-time logic or already stored in DB
          return Promise.resolve();
        default:
          logger.warn('Unknown channel', { channel });
      }
    });

    await Promise.allSettled(deliveryPromises);
  }

  private async sendEmail(
    notificationId: string,
    email: string,
    content: {
      emailSubject?: string;
      emailHtml?: string;
      emailText?: string;
      title: string;
      message: string;
    },
  ): Promise<void> {
    if (!this.emailTransporter) {
      await this.logDelivery({
        notification_id: notificationId,
        channel: 'email',
        status: 'failed',
        recipient: email,
        error_message: 'Email transporter not configured',
        failed_at: new Date(),
      });
      return;
    }

    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.EMAIL_USER,
        to: email,
        subject: content.emailSubject || content.title,
        text: content.emailText || content.message,
        html: content.emailHtml || `<p>${content.message}</p>`,
      };

      const info = await this.emailTransporter.sendMail(mailOptions);

      await this.logDelivery({
        notification_id: notificationId,
        channel: 'email',
        status: 'sent',
        recipient: email,
        provider: 'nodemailer',
        provider_message_id: info.messageId,
        provider_response: info,
        sent_at: new Date(),
      });
    } catch (error) {
      logger.error('Email delivery failed', { notificationId, email, error });
      await this.logDelivery({
        notification_id: notificationId,
        channel: 'email',
        status: 'failed',
        recipient: email,
        provider: 'nodemailer',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        failed_at: new Date(),
      });
    }
  }

  private async sendSMS(
    notificationId: string,
    phone: string,
    content: { smsMessage?: string; message: string },
  ): Promise<void> {
    // Placeholder for SMS provider integration (Twilio/AWS SNS)
    logger.info('SMS sending placeholder', {
      notificationId,
      phone,
      message: content.smsMessage || content.message,
    });

    await this.logDelivery({
      notification_id: notificationId,
      channel: 'sms',
      status: 'pending',
      recipient: phone,
      provider: 'placeholder',
      sent_at: new Date(),
    });
  }

  private async logDelivery(data: {
    notification_id: string;
    channel: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
    recipient?: string;
    provider?: string;
    provider_message_id?: string;
    provider_response?: any;
    error_message?: string;
    error_code?: string;
    sent_at?: Date;
    delivered_at?: Date;
    failed_at?: Date;
  }): Promise<void> {
    try {
      await db.insert(notificationDeliveryLogs).values(data);
    } catch (error) {
      logger.error('Failed to log notification delivery', { error, data });
    }
  }
}

export const deliveryService = new DeliveryService();
