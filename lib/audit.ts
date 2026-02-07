import { prisma } from "./prisma";

export type AuditAction =
    | "CREATE_MANGA"
    | "UPDATE_MANGA"
    | "DELETE_MANGA"
    | "RESTORE_MANGA"
    | "DELETE_CHAPTER"
    | "UPDATE_USER_ROLE"
    | "APPROVE_PAYMENT"
    | "REJECT_PAYMENT"
    | "DELETE_PAYMENT"
    | "MODERATE_COMMENT"
    | "DELETE_COMMENT";

export type AuditTargetType = "MANGA" | "CHAPTER" | "USER" | "PAYMENT_REQUEST" | "COMMENT";

interface AuditLogOptions {
    userId: string;
    action: AuditAction;
    targetType: AuditTargetType;
    targetId: string;
    details?: string | object;
    ipAddress?: string;
}

/**
 * Records an administrative action to the AuditLog table.
 */
export async function recordAuditAction(options: AuditLogOptions) {
    try {
        const detailsString = options.details
            ? (typeof options.details === 'string' ? options.details : JSON.stringify(options.details))
            : null;

        return await prisma.auditLog.create({
            data: {
                userId: options.userId,
                action: options.action,
                targetType: options.targetType,
                targetId: options.targetId,
                details: detailsString,
                ipAddress: options.ipAddress,
            }
        });
    } catch (error) {
        console.error("[AuditLog] Failed to record action:", error);
        // We don't throw here to avoid failing the main action if auditing fails,
        // though in high-security environments you might want to.
        return null;
    }
}
