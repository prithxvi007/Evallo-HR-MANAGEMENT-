import { AuditLog } from '@/lib/models';

export async function logAction(userId, organizationId, action, resourceType = null, resourceId = null, meta = {}) {
  try {
    await AuditLog.create({
      userId,
      organization: organizationId,
      action,
      resourceType,
      resourceId,
      meta,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw error to prevent breaking the main operation
  }
}