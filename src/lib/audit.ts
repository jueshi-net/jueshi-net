import { prisma } from './prisma';

interface AuditOptions {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ip?: string;
}

export async function auditLog(opts: AuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        details: opts.details ? JSON.stringify(opts.details) : null,
        ip: opts.ip,
      }
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
