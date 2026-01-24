import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "./logger";

/**
 * Standardized API Error Response Helper
 */
export function handleApiError(error: unknown, context?: string) {
    const errorMsg = context ? `[${context}] ` : '';

    // Log the error centrally
    logger.error(`${errorMsg}${error instanceof Error ? error.message : "Unknown error"}`, {
        context: { error }
    });

    // Handle Zod Validation Errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            },
            { status: 400 }
        );
    }

    // Handle Prisma Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g. duplicate email)
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Нэгэнт бүртгэгдсэн өгөгдөл байна." },
                { status: 409 }
            );
        }
        // Record not found
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: "Өгөгдөл олдсонгүй." },
                { status: 404 }
            );
        }
    }

    // Default Error Response
    return NextResponse.json(
        {
            error: "Дотоод алдаа гарлаа. Та дахин оролдоно уу.",
            details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
        },
        { status: 500 }
    );
}

export function createErrorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}
