import prisma from '../config/database';

export interface RecordActivityParams {
  userId?: string;
  eventType: string;
  path?: string;
  metadata?: any;
}

export const recordActivityEvent = async (params: RecordActivityParams) => {
  if (!params.eventType || !params.eventType.trim()) {
    throw new Error('eventType is required');
  }

  const metadataStr = params.metadata
    ? typeof params.metadata === 'string'
      ? params.metadata
      : JSON.stringify(params.metadata)
    : null;

  const event = await prisma.activityEvent.create({
    data: {
      userId: params.userId || null,
      eventType: params.eventType.trim(),
      path: params.path || null,
      metadata: metadataStr,
      timestamp: new Date(),
    },
  });

  return event;
};
