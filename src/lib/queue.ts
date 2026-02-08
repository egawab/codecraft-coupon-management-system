import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Create Redis connection for BullMQ (only if Redis URL is configured)
const connection = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true, // Don't connect immediately
    })
  : null;

// Analytics aggregation queue
export const analyticsQueue = connection ? new Queue('analytics-aggregation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 1 day
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
}) : null as any;

// Notification queue
export const notificationQueue = connection ? new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 86400,
      count: 1000,
    },
    removeOnFail: {
      age: 604800,
    },
  },
}) : null as any;

// Queue events for monitoring
export const analyticsQueueEvents = connection ? new QueueEvents('analytics-aggregation', {
  connection,
}) : null as any;

export const notificationQueueEvents = connection ? new QueueEvents('notifications', {
  connection,
}) : null as any;

// Event listeners (only if connection exists)
if (analyticsQueueEvents) {
  analyticsQueueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Analytics job ${jobId} completed`);
  });

  analyticsQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Analytics job ${jobId} failed:`, failedReason);
  });
}

if (notificationQueueEvents) {
  notificationQueueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Notification job ${jobId} completed`);
  });

  notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Notification job ${jobId} failed:`, failedReason);
  });
}

// Job types
export interface AggregateAnalyticsJob {
  couponIds?: string[];
  storeIds?: string[];
  date?: string; // ISO date string
}

export interface SendNotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  couponId?: string;
  storeId?: string;
  affiliateId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

// Helper functions to add jobs
export async function scheduleAnalyticsAggregation(
  data: AggregateAnalyticsJob = {},
  delay?: number
) {
  if (!analyticsQueue) {
    console.warn('Analytics queue not configured - Redis URL missing');
    return { id: 'no-queue', data };
  }
  return analyticsQueue.add('aggregate', data, {
    delay,
  });
}

export async function sendNotification(data: SendNotificationJob) {
  if (!notificationQueue) {
    console.warn('Notification queue not configured - Redis URL missing');
    return { id: 'no-queue', data };
  }
  return notificationQueue.add('send', data);
}

// Cleanup function
export async function closeQueues() {
  if (analyticsQueue) await analyticsQueue.close();
  if (notificationQueue) await notificationQueue.close();
  if (analyticsQueueEvents) await analyticsQueueEvents.close();
  if (notificationQueueEvents) await notificationQueueEvents.close();
  if (connection) await connection.quit();
}
